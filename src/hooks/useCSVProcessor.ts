
import { useState } from "react";
import { toast } from "@/components/ui/use-toast";
import { parseCSVLine, escapeCSVValue } from "@/utils/csvUtils";
import { shopifyFields, autoMapFields } from "@/utils/fieldMappingUtils";
import { saveMappingConfiguration } from "@/utils/mappingStorage";
import { processExcelFile, convertCSVToExcel } from "@/utils/excelUtils";
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

  const processCSV = async (file: File, skipUpload: boolean = false) => {
    setIsProcessing(true);
    setProgress(0);
    setFileName(`ShopifyCSV-${file.name}`);

    try {
      let text: string;
      
      if (file.name.toLowerCase().endsWith('.csv')) {
        const reader = new FileReader();
        text = await new Promise((resolve, reject) => {
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.onerror = reject;
          reader.readAsText(file);
        });
      } else {
        // Process Excel file
        text = await processExcelFile(file);
      }

      setRawCSV(text);
      const lines = text.split(/\r?\n/).filter(line => line.trim());
      const headers = parseCSVLine(lines[0]);
      setUploadedHeaders(headers);
      
      const data = lines.slice(1).map(line => {
        const values = parseCSVLine(line);
        return headers.reduce((obj: any, header, index) => {
          obj[header] = values[index] || '';
          return obj;
        }, {});
      });
      setCsvData(data);

      const autoMapped = autoMapFields(headers, shopifyFields);
      setFieldMapping(autoMapped);
      setIsAutoMapped(true);

      // Upload the file to Supabase Storage if not skipping upload
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
        description: "Please review the field mappings and adjust if needed before downloading.",
      });

    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process file. Please make sure the file is a valid CSV or Excel file.",
        variant: "destructive",
      });
    }

    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += 10;
      setProgress(currentProgress);
      
      if (currentProgress >= 100) {
        clearInterval(interval);
        setIsProcessing(false);
      }
    }, 500);
  };

  const handleFieldMapping = (shopifyField: string, uploadedField: string) => {
    setFieldMapping(prev => ({
      ...prev,
      [shopifyField]: uploadedField
    }));
  };

  const generateProcessedCSV = () => {
    const processedData = csvData.map(row => {
      const processedRow: { [key: string]: string } = {};
      shopifyFields.forEach(shopifyField => {
        const mappedField = fieldMapping[shopifyField];
        const value = mappedField && mappedField !== "" ? (row[mappedField] || '') : '';
        processedRow[shopifyField] = escapeCSVValue(value);
      });
      return processedRow;
    });

    const csv = [
      shopifyFields.join(','),
      ...processedData.map(row => shopifyFields.map(field => row[field]).join(','))
    ].join('\n');

    return csv;
  };

  const downloadFile = () => {
    const csv = generateProcessedCSV();
    const isExcel = fileName.toLowerCase().endsWith('.xlsx');

    if (isExcel) {
      // Convert to Excel and download
      const excelBlob = convertCSVToExcel(csv, fileName);
      const url = window.URL.createObjectURL(excelBlob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } else {
      // Download as CSV
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
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
    downloadFile
  };
};
