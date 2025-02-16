import { useState } from "react";
import { toast } from "@/components/ui/use-toast";
import { parseCSVLine, escapeCSVValue } from "@/utils/csvUtils";
import { shopifyFields, autoMapFields } from "@/utils/fieldMappingUtils";
import { saveMappingConfiguration } from "@/utils/mappingStorage";
import { processExcelFile } from "@/utils/excelUtils";
import { supabase } from "@/integrations/supabase/client";

interface FieldMapping {
  [key: string]: string;
}

export const useCSVProcessor = () => {
  const [progress, setProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedHeaders, setUploadedHeaders] = useState<string[]>([]);
  const [fieldMapping, setFieldMapping] = useState<FieldMapping>({});
  const [csvData, setCsvData] = useState<any[]>([]);
  const [isAutoMapped, setIsAutoMapped] = useState(false);
  const [fileName, setFileName] = useState<string>("");
  const [rawCSV, setRawCSV] = useState<string>("");
  const [selectedVendors, setSelectedVendors] = useState<string[]>([]);
  const [vendorFilterField, setVendorFilterField] = useState<string>("");
  const [chunks, setChunks] = useState<string[]>([]);
  const [isLargeFile, setIsLargeFile] = useState(false);
  const [availableSheets, setAvailableSheets] = useState<Array<{ name: string; rowCount: number }>>([]);
  const [showSheetSelector, setShowSheetSelector] = useState(false);
  const [currentFile, setCurrentFile] = useState<File | null>(null);

  const getUniqueVendors = (): string[] => {
    if (!vendorFilterField) return [];
    
    const vendors = new Set(csvData.map(row => row[vendorFilterField]));
    return Array.from(vendors).filter(Boolean).sort();
  };

  const getProductCountByVendor = (): { [key: string]: number } => {
    if (!vendorFilterField) return {};
    
    return csvData.reduce((acc: { [key: string]: number }, row) => {
      const vendor = row[vendorFilterField];
      if (vendor) {
        acc[vendor] = (acc[vendor] || 0) + 1;
      }
      return acc;
    }, {});
  };

  const processCSV = async (file: File, skipUpload: boolean = false, selectedSheet?: string) => {
    setIsProcessing(true);
    setProgress(0);
    
    const baseFileName = file.name.replace(/\.[^/.]+$/, "");
    setFileName(`ShopifyCSV-${baseFileName}`);
    setSelectedVendors([]); // Reset selected vendors
    setVendorFilterField(""); // Reset vendor filter field

    try {
      let text: string;
      let headers: string[];
      
      if (file.name.toLowerCase().endsWith('.csv')) {
        const reader = new FileReader();
        text = await new Promise((resolve, reject) => {
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.onerror = reject;
          reader.readAsText(file);
        });
        setRawCSV(text);
        const lines = text.split(/\r?\n/).filter(line => line.trim());
        headers = parseCSVLine(lines[0]);
        setUploadedHeaders(headers);
        
        const data = lines.slice(1).map(line => {
          const values = parseCSVLine(line);
          return headers.reduce((obj: any, header, index) => {
            obj[header] = values[index] || '';
            return obj;
          }, {});
        });
        setCsvData(data);
      } else {
        // Process Excel file
        setIsLargeFile(file.size > 10 * 1024 * 1024);
        
        // If no sheet is selected, get the sheet list first
        if (!selectedSheet) {
          const { sheets } = await processExcelFile(file);
          if (sheets && sheets.length > 1) {
            setAvailableSheets(sheets);
            setCurrentFile(file);
            setShowSheetSelector(true);
            setIsProcessing(false);
            return;
          }
          // If only one sheet, use it automatically
          selectedSheet = sheets?.[0]?.name;
        }
        
        const { headers: excelHeaders, chunks: excelChunks } = await processExcelFile(file, selectedSheet);
        
        if (!excelHeaders || !excelChunks) {
          throw new Error('Failed to process Excel file');
        }
        
        headers = excelHeaders;
        setUploadedHeaders(headers);
        setChunks(excelChunks);
        
        // Process first chunk to show initial data
        const firstChunkData = excelChunks[0].split('\n').map(line => {
          const values = parseCSVLine(line);
          return headers.reduce((obj: any, header, index) => {
            obj[header] = values[index] || '';
            return obj;
          }, {});
        });
        setCsvData(firstChunkData);
        setRawCSV(excelChunks.join('\n'));
      }

      const autoMapped = autoMapFields(headers, shopifyFields);
      setFieldMapping(autoMapped);
      setIsAutoMapped(true);

      // Try to auto-map vendor filter field
      const vendorKeywords = ['vendor', 'supplier', 'manufacturer', 'brand'];
      const possibleVendorField = headers.find(header => 
        vendorKeywords.some(keyword => header.toLowerCase().includes(keyword))
      );
      if (possibleVendorField) {
        setVendorFilterField(possibleVendorField);
      }

      if (!skipUpload) {
        const user = (await supabase.auth.getUser()).data.user;
        if (user) {
          const formData = new FormData();
          formData.append('file', file);
          formData.append('userId', user.id);

          const response = await supabase.functions.invoke('upload-csv', {
            body: formData,
          });

          if (response.error) {
            toast({
              title: "Error",
              description: "Failed to upload file. Your mapping will still work but won't be saved for later use.",
              variant: "destructive",
            });
          }
        }
      }
      
      toast({
        title: "Fields Auto-Mapped",
        description: isLargeFile 
          ? "Large file detected. Data is being processed in chunks for better performance."
          : "Please review the field mappings and adjust if needed before downloading.",
      });

    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process file. Please make sure the file is a valid CSV or Excel file.",
        variant: "destructive",
      });
      console.error('File processing error:', error);
    }

    setProgress(100);
    setIsProcessing(false);
  };

  const handleFieldMapping = (shopifyField: string, uploadedField: string) => {
    setFieldMapping(prev => ({
      ...prev,
      [shopifyField]: uploadedField
    }));
  };

  const handleVendorFilterMapping = (field: string) => {
    setVendorFilterField(field);
    setSelectedVendors([]); // Reset selected vendors when mapping changes
  };

  const generateProcessedCSV = () => {
    const processChunk = (data: any[]) => {
      return data
        .filter(row => !vendorFilterField || selectedVendors.length === 0 || selectedVendors.includes(row[vendorFilterField]))
        .map(row => {
          const processedRow: { [key: string]: string } = {};
          shopifyFields.forEach(shopifyField => {
            const mappedField = fieldMapping[shopifyField];
            const value = mappedField && mappedField !== "" ? (row[mappedField] || '') : '';
            processedRow[shopifyField] = escapeCSVValue(value);
          });
          return processedRow;
        });
    };

    if (isLargeFile && chunks.length > 0) {
      // Process chunks one at a time
      const headers = shopifyFields.join(',');
      const processedChunks = chunks.map(chunk => {
        const chunkData = chunk.split('\n').map(line => {
          const values = parseCSVLine(line);
          return uploadedHeaders.reduce((obj: any, header, index) => {
            obj[header] = values[index] || '';
            return obj;
          }, {});
        });
        return processChunk(chunkData)
          .map(row => shopifyFields.map(field => row[field]).join(','))
          .join('\n');
      });
      
      return [headers, ...processedChunks].join('\n');
    } else {
      // Process as before for smaller files
      const processedData = processChunk(csvData);
      return [
        shopifyFields.join(','),
        ...processedData.map(row => shopifyFields.map(field => row[field]).join(','))
      ].join('\n');
    }
  };

  const handleSheetSelect = (sheetName: string) => {
    setShowSheetSelector(false);
    if (currentFile) {
      processCSV(currentFile, false, sheetName);
    }
  };

  return {
    progress,
    isProcessing,
    uploadedHeaders,
    fieldMapping,
    isAutoMapped,
    fileName,
    shopifyFields,
    processCSV,
    handleFieldMapping,
    saveMappingConfiguration,
    generateProcessedCSV,
    setFileName,
    rawCSV,
    getUniqueVendors,
    getProductCountByVendor,
    selectedVendors,
    setSelectedVendors,
    vendorFilterField,
    handleVendorFilterMapping,
    showSheetSelector,
    availableSheets,
    handleSheetSelect
  };
};
