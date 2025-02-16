
import { useState } from "react";
import { toast } from "@/components/ui/use-toast";
import { shopifyFields } from "@/utils/fieldMappingUtils";
import { saveMappingConfiguration } from "@/utils/mappingStorage";
import { processExcelFile, processExcelSheet } from "@/utils/excelUtils";
import { supabase } from "@/integrations/supabase/client";
import { processFileContent, generateProcessedCSV } from "@/utils/csvProcessor";
import { downloadProcessedFile } from "@/utils/fileDownloader";
import { FieldMapping, CSVState } from "@/types/csv";

const FILE_SIZE_WARNING_THRESHOLD = 5 * 1024 * 1024; // 5MB in bytes

export const useCSVProcessor = () => {
  const [state, setState] = useState<CSVState>({
    progress: 0,
    isProcessing: false,
    uploadedHeaders: [],
    fieldMapping: {},
    csvData: [],
    isAutoMapped: false,
    fileName: "",
    rawCSV: "",
    availableSheets: [],
    showSheetSelector: false,
    pendingExcelFile: null,
    skipUploadFlag: false,
  });

  const handleSheetSelect = async (sheetName: string) => {
    if (!state.pendingExcelFile) return;
    
    try {
      const csvContent = await processExcelSheet(state.pendingExcelFile, sheetName);
      const { headers, data, autoMapped } = processFileContent(csvContent);
      
      setState(prev => ({
        ...prev,
        rawCSV: csvContent,
        uploadedHeaders: headers,
        csvData: data,
        fieldMapping: autoMapped,
        isAutoMapped: true,
      }));
      
      // Handle file upload if needed
      if (!state.skipUploadFlag) {
        await handleFileUpload(state.pendingExcelFile);
      }
      
      setState(prev => ({
        ...prev,
        showSheetSelector: false,
        pendingExcelFile: null,
        skipUploadFlag: false,
      }));
      
      toast({
        title: "Fields Auto-Mapped",
        description: "Please review the field mappings and adjust if needed before downloading.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process sheet. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleFileUpload = async (file: File) => {
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
  };

  const processCSV = async (file: File, skipUpload: boolean = false) => {
    // Check file size and show warning if necessary
    if (file.size > FILE_SIZE_WARNING_THRESHOLD) {
      const fileSizeMB = (file.size / (1024 * 1024)).toFixed(1);
      toast({
        title: "Large File Detected",
        description: `This file is ${fileSizeMB}MB. Processing may take longer than usual. Please be patient while we handle your file.`,
        duration: 6000,
      });
    }

    setState(prev => ({
      ...prev,
      isProcessing: true,
      progress: 0,
      fileName: `ShopifyCSV-${file.name}`,
      skipUploadFlag: skipUpload,
    }));

    try {
      if (file.name.toLowerCase().endsWith('.csv')) {
        const reader = new FileReader();
        const text = await new Promise<string>((resolve, reject) => {
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.onerror = reject;
          reader.readAsText(file);
        });

        const { headers, data, autoMapped } = processFileContent(text);
        setState(prev => ({
          ...prev,
          rawCSV: text,
          uploadedHeaders: headers,
          csvData: data,
          fieldMapping: autoMapped,
          isAutoMapped: true,
        }));

        if (!skipUpload) {
          await handleFileUpload(file);
        }

      } else {
        // Process Excel file
        const result = await processExcelFile(file);
        if (result.sheets) {
          // Multiple sheets found
          setState(prev => ({
            ...prev,
            availableSheets: result.sheets,
            showSheetSelector: true,
            pendingExcelFile: file,
          }));
          return;
        } else if (result.csvContent) {
          // Single sheet
          const { headers, data, autoMapped } = processFileContent(result.csvContent);
          setState(prev => ({
            ...prev,
            rawCSV: result.csvContent,
            uploadedHeaders: headers,
            csvData: data,
            fieldMapping: autoMapped,
            isAutoMapped: true,
          }));

          if (!skipUpload) {
            await handleFileUpload(file);
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
      setState(prev => ({ ...prev, progress: currentProgress }));
      
      if (currentProgress >= 100) {
        clearInterval(interval);
        setState(prev => ({ ...prev, isProcessing: false }));
      }
    }, 500);
  };

  const handleFieldMapping = (shopifyField: string, uploadedField: string) => {
    setState(prev => ({
      ...prev,
      fieldMapping: {
        ...prev.fieldMapping,
        [shopifyField]: uploadedField
      }
    }));
  };

  const downloadFile = () => {
    const csv = generateProcessedCSV(state.csvData, state.fieldMapping);
    downloadProcessedFile(csv, state.fileName);
  };

  return {
    ...state,
    processCSV,
    handleFieldMapping,
    saveMappingConfiguration,
    generateProcessedCSV,
    setFileName: (fileName: string) => setState(prev => ({ ...prev, fileName })),
    setShowSheetSelector: (show: boolean) => setState(prev => ({ ...prev, showSheetSelector: show })),
    handleSheetSelect,
    downloadFile,
    shopifyFields,
  };
};
