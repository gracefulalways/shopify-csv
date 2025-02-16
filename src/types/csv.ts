
export interface FieldMapping {
  [key: string]: string;
}

export interface CSVState {
  progress: number;
  isProcessing: boolean;
  uploadedHeaders: string[];
  fieldMapping: FieldMapping;
  csvData: any[];
  isAutoMapped: boolean;
  fileName: string;
  rawCSV: string;
  availableSheets: string[];
  showSheetSelector: boolean;
  pendingExcelFile: File | null;
  skipUploadFlag: boolean;
}
