
import { useState } from "react";
import { CSVState, FieldMapping } from "@/types/csv";

export const useCSVState = () => {
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

  const updateState = (updates: Partial<CSVState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  const updateFieldMapping = (shopifyField: string, uploadedField: string) => {
    setState(prev => ({
      ...prev,
      fieldMapping: {
        ...prev.fieldMapping,
        [shopifyField]: uploadedField
      }
    }));
  };

  const setFileName = (fileName: string) => setState(prev => ({ ...prev, fileName }));
  const setShowSheetSelector = (show: boolean) => setState(prev => ({ ...prev, showSheetSelector: show }));
  const updateProgress = (progress: number) => setState(prev => ({ ...prev, progress }));
  const setProcessing = (isProcessing: boolean) => setState(prev => ({ ...prev, isProcessing }));

  return {
    state,
    updateState,
    updateFieldMapping,
    setFileName,
    setShowSheetSelector,
    updateProgress,
    setProcessing
  };
};
