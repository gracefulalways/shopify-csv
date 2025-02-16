
import { useState } from 'react';
import { processExcelFile } from '@/utils/excelUtils';
import { parseCSVLine } from '@/utils/csvUtils';
import { SheetInfo } from '@/types/csv';

export const useExcelData = () => {
  const [chunks, setChunks] = useState<string[]>([]);
  const [isLargeFile, setIsLargeFile] = useState(false);
  const [availableSheets, setAvailableSheets] = useState<SheetInfo[]>([]);
  const [showSheetSelector, setShowSheetSelector] = useState(false);
  const [currentFile, setCurrentFile] = useState<File | null>(null);

  const processExcelContent = async (
    file: File,
    selectedSheet: string | undefined,
    setHeaders: (headers: string[]) => void,
    setData: (data: any[]) => void,
    setRawCSV: (csv: string) => void
  ) => {
    setIsLargeFile(file.size > 10 * 1024 * 1024);
    
    if (!selectedSheet) {
      const { sheets } = await processExcelFile(file);
      if (sheets && sheets.length > 1) {
        setAvailableSheets(sheets);
        setCurrentFile(file);
        setShowSheetSelector(true);
        return { shouldContinue: false };
      }
      selectedSheet = sheets?.[0]?.name;
    }
    
    const { headers: excelHeaders, chunks: excelChunks } = await processExcelFile(file, selectedSheet);
    
    if (!excelHeaders || !excelChunks) {
      throw new Error('Failed to process Excel file');
    }
    
    setHeaders(excelHeaders);
    setChunks(excelChunks);
    
    // Process first chunk to show initial data
    const firstChunkData = excelChunks[0].split('\n').map(line => {
      const values = parseCSVLine(line);
      return excelHeaders.reduce((obj: any, header, index) => {
        obj[header] = values[index] || '';
        return obj;
      }, {});
    });
    setData(firstChunkData);
    setRawCSV(excelChunks.join('\n'));
    
    return { shouldContinue: true };
  };

  return {
    chunks,
    isLargeFile,
    availableSheets,
    showSheetSelector,
    currentFile,
    setShowSheetSelector,
    processExcelContent,
    setCurrentFile
  };
};
