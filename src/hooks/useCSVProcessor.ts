
import { toast } from "@/components/ui/use-toast";
import { shopifyFields } from "@/utils/fieldMappingUtils";
import { saveMappingConfiguration } from "@/utils/mappingStorage";
import { processExcelFile } from "@/utils/excelUtils";
import { processFileContent, generateProcessedCSV } from "@/utils/csvProcessor";
import { downloadProcessedFile } from "@/utils/fileDownloader";
import { useCSVState } from "./useCSVState";
import { useSheetProcessor } from "./useSheetProcessor";
import { checkFileSize, handleFileUpload } from "@/utils/fileUploadHandler";

export const useCSVProcessor = () => {
  const {
    state,
    updateState,
    updateFieldMapping,
    setFileName,
    setShowSheetSelector,
    updateProgress,
    setProcessing
  } = useCSVState();

  const { handleSheetSelect: processSheet } = useSheetProcessor(updateState);

  const handleSheetSelect = async (sheetName: string) => {
    await processSheet(state.pendingExcelFile, sheetName, state.skipUploadFlag);
  };

  const processCSV = async (file: File, skipUpload: boolean = false) => {
    checkFileSize(file);

    updateState({
      isProcessing: true,
      progress: 0,
      fileName: `ShopifyCSV-${file.name}`,
      skipUploadFlag: skipUpload,
    });

    try {
      if (file.name.toLowerCase().endsWith('.csv')) {
        const reader = new FileReader();
        const text = await new Promise<string>((resolve, reject) => {
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.onerror = reject;
          reader.readAsText(file);
        });

        const { headers, data, autoMapped } = processFileContent(text);
        updateState({
          rawCSV: text,
          uploadedHeaders: headers,
          csvData: data,
          fieldMapping: autoMapped,
          isAutoMapped: true,
        });

        if (!skipUpload) {
          await handleFileUpload(file);
        }

      } else {
        // Process Excel file
        const result = await processExcelFile(file);
        if (result.sheets) {
          // Multiple sheets found
          updateState({
            availableSheets: result.sheets,
            showSheetSelector: true,
            pendingExcelFile: file,
          });
          return;
        } else if (result.csvContent) {
          // Single sheet
          const { headers, data, autoMapped } = processFileContent(result.csvContent);
          updateState({
            rawCSV: result.csvContent,
            uploadedHeaders: headers,
            csvData: data,
            fieldMapping: autoMapped,
            isAutoMapped: true,
          });

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
      updateProgress(currentProgress);
      
      if (currentProgress >= 100) {
        clearInterval(interval);
        setProcessing(false);
      }
    }, 500);
  };

  const downloadFile = () => {
    const csv = generateProcessedCSV(state.csvData, state.fieldMapping);
    downloadProcessedFile(csv, state.fileName);
  };

  return {
    ...state,
    processCSV,
    handleFieldMapping: updateFieldMapping,
    saveMappingConfiguration,
    generateProcessedCSV,
    setFileName,
    setShowSheetSelector,
    handleSheetSelect,
    downloadFile,
    shopifyFields,
  };
};
