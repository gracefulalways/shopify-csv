
import { useState } from "react";
import { toast } from "@/components/ui/use-toast";
import { escapeCSVValue, parseCSVLine } from "@/utils/csvUtils"; // Added parseCSVLine import
import { shopifyFields } from "@/utils/fieldMappingUtils";
import { saveMappingConfiguration } from "@/utils/mappingStorage";
import { supabase } from "@/integrations/supabase/client";
import { useCSVData } from "./useCSVData";
import { useExcelData } from "./useExcelData";

export const useCSVProcessor = () => {
  const [progress, setProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const {
    fileName,
    setFileName,
    uploadedHeaders,
    setUploadedHeaders,
    fieldMapping,
    csvData,
    setCsvData,
    isAutoMapped,
    rawCSV,
    setRawCSV,
    selectedVendors,
    setSelectedVendors,
    vendorFilterField,
    handleFieldMapping,
    handleVendorFilterMapping,
    processCSVContent,
    getUniqueVendors,
    getProductCountByVendor
  } = useCSVData();

  const {
    chunks,
    isLargeFile,
    availableSheets,
    showSheetSelector,
    currentFile,
    setShowSheetSelector,
    processExcelContent,
    setCurrentFile
  } = useExcelData();

  const processCSV = async (file: File, skipUpload: boolean = false, selectedSheet?: string) => {
    setIsProcessing(true);
    setProgress(0);
    
    const baseFileName = file.name.replace(/\.[^/.]+$/, "");
    setFileName(`ShopifyCSV-${baseFileName}`);
    setSelectedVendors([]); // Reset selected vendors
    
    try {
      if (file.name.toLowerCase().endsWith('.csv')) {
        const reader = new FileReader();
        const text = await new Promise<string>((resolve, reject) => {
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.onerror = reject;
          reader.readAsText(file);
        });
        setRawCSV(text);
        processCSVContent(text);
      } else {
        const result = await processExcelContent(
          file,
          selectedSheet,
          setUploadedHeaders,
          setCsvData,
          setRawCSV
        );
        
        if (!result?.shouldContinue) {
          setIsProcessing(false);
          return;
        }
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
