
import { useState } from "react";
import { toast } from "@/components/ui/use-toast";
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

  const shopifyFields = [
    "Handle",
    "Title",
    "Body (HTML)",
    "Vendor",
    "Product Category",
    "Type",
    "Tags",
    "Published",
    "Option1 Name",
    "Option1 Value",
    "Variant SKU",
    "Variant Price",
    "Variant Compare At Price",
    "Variant Inventory Tracker",
    "Variant Inventory Quantity",
    "Variant Weight",
    "Variant Weight Unit",
    "Image Src",
    "Status"
  ];

  const autoMapFields = (headers: string[]) => {
    const newMapping: FieldMapping = {};
    
    shopifyFields.forEach(shopifyField => {
      const shopifyFieldLower = shopifyField.toLowerCase();
      
      let match = headers.find(header => 
        header.toLowerCase() === shopifyFieldLower
      );
      
      if (!match) {
        match = headers.find(header => {
          const headerLower = header.toLowerCase();
          const cleanShopifyField = shopifyFieldLower.replace(/variant |option\d+ /g, '');
          const cleanHeader = headerLower.replace(/variant |option\d+ /g, '');
          return cleanHeader.includes(cleanShopifyField) || cleanShopifyField.includes(cleanHeader);
        });
      }
      
      if (match) {
        newMapping[shopifyField] = match;
      }
    });

    return newMapping;
  };

  const processCSV = (file: File) => {
    setIsProcessing(true);
    setProgress(0);
    
    const reader = new FileReader();
    setFileName(`ShopifyCSV-${file.name}`);

    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n');
      const headers = lines[0].split(',').map(header => header.trim());
      setUploadedHeaders(headers);
      
      const data = lines.slice(1).map(line => {
        const values = line.split(',');
        return headers.reduce((obj: any, header, index) => {
          obj[header] = values[index];
          return obj;
        }, {});
      });
      setCsvData(data);

      const autoMapped = autoMapFields(headers);
      setFieldMapping(autoMapped);
      setIsAutoMapped(true);
      
      toast({
        title: "Fields Auto-Mapped",
        description: "Please review the field mappings and adjust if needed before downloading.",
      });
    };
    reader.readAsText(file);
    
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

  const saveMappingConfiguration = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('mapping_history')
        .insert({
          user_id: userId,
          original_filename: fileName,
          mapping_config: fieldMapping,
          is_deleted: false
        });

      if (error) {
        if (error.message.includes('upgrade to save more files')) {
          toast({
            title: "File Limit Reached",
            description: "Free users can only save up to 3 files. Please upgrade to save more files.",
            variant: "destructive",
          });
        } else {
          throw error;
        }
        return;
      }

      toast({
        title: "Success",
        description: "Mapping configuration saved successfully!",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to save mapping configuration: " + error.message,
        variant: "destructive",
      });
    }
  };

  const generateProcessedCSV = () => {
    const processedData = csvData.map(row => {
      const processedRow: { [key: string]: string } = {};
      shopifyFields.forEach(shopifyField => {
        // If there's no mapping for this field or the mapping is empty string, use empty string
        processedRow[shopifyField] = fieldMapping[shopifyField] ? row[fieldMapping[shopifyField]] || '' : '';
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
    setFileName
  };
};
