
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

  const resetFieldMapping = () => {
    if (uploadedHeaders.length > 0) {
      tryAIMapping();
    } else {
      setFieldMapping({});
      setIsAutoMapped(false);
    }
  };

  const tryAIMapping = async () => {
    try {
      const { data: { exists } } = await supabase.functions.invoke('manage-api-key', {
        body: { action: 'check', key_type: 'openai' }
      });

      if (!exists) {
        // Fall back to basic auto-mapping if no OpenAI key is configured
        const newMapping = autoMapFields(uploadedHeaders, shopifyFields);
        setFieldMapping(newMapping);
        setIsAutoMapped(true);
        return;
      }

      const { data, error } = await supabase.functions.invoke('ai-field-mapping', {
        body: { 
          uploadedHeaders,
          shopifyFields
        }
      });

      if (error) throw error;

      if (data?.mapping) {
        setFieldMapping(data.mapping);
        setIsAutoMapped(true);
        toast({
          title: "AI Mapping Complete",
          description: "Fields have been automatically mapped using AI. Please review the mappings.",
        });
      }
    } catch (error: any) {
      console.error('Error in AI mapping:', error);
      // Fall back to basic auto-mapping
      const newMapping = autoMapFields(uploadedHeaders, shopifyFields);
      setFieldMapping(newMapping);
      setIsAutoMapped(true);
      toast({
        title: "Using Basic Mapping",
        description: "AI mapping failed, using basic field matching instead.",
        variant: "destructive",
      });
    }
  };

  const processCSV = async (file: File, skipUpload: boolean = false) => {
    setIsProcessing(true);
    setProgress(0);
    
    const baseFileName = file.name.replace(/\.[^/.]+$/, '');
    setFileName(`ShopifyCSV-${baseFileName}.csv`);

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

      // Try AI mapping first
      await tryAIMapping();

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

    } catch (error: any) {
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
    resetFieldMapping
  };
};
