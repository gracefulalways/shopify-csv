
import { toast } from "@/components/ui/use-toast";
import { processExcelSheet } from "@/utils/excelUtils";
import { processFileContent } from "@/utils/csvProcessor";
import { handleFileUpload } from "@/utils/fileUploadHandler";

export const useSheetProcessor = (updateState: (updates: any) => void) => {
  const handleSheetSelect = async (file: File | null, sheetName: string, skipUpload: boolean) => {
    if (!file) return;
    
    try {
      const csvContent = await processExcelSheet(file, sheetName);
      const { headers, data, autoMapped } = processFileContent(csvContent);
      
      updateState({
        rawCSV: csvContent,
        uploadedHeaders: headers,
        csvData: data,
        fieldMapping: autoMapped,
        isAutoMapped: true,
      });
      
      if (!skipUpload) {
        await handleFileUpload(file);
      }
      
      updateState({
        showSheetSelector: false,
        pendingExcelFile: null,
        skipUploadFlag: false,
      });
      
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

  return { handleSheetSelect };
};
