
import { read, utils, WorkBook } from 'xlsx';

self.onmessage = async (e: MessageEvent) => {
  const { file, action, sheetName } = e.data;
  
  try {
    switch (action) {
      case 'processFile':
        await processExcelFile(file);
        break;
      case 'processSheet':
        await processSpecificSheet(file, sheetName);
        break;
    }
  } catch (error) {
    self.postMessage({ type: 'error', error: error.message });
  }
};

const processExcelFile = async (file: File) => {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = read(arrayBuffer, { type: 'array', cellDates: true });
  
  if (workbook.SheetNames.length > 1) {
    self.postMessage({ type: 'sheets', sheets: workbook.SheetNames });
  } else {
    const csvContent = await processWorkbookSheet(workbook, workbook.SheetNames[0]);
    self.postMessage({ type: 'complete', csvContent });
  }
};

const processSpecificSheet = async (file: File, sheetName: string) => {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = read(arrayBuffer, { type: 'array', cellDates: true });
  const csvContent = await processWorkbookSheet(workbook, sheetName);
  self.postMessage({ type: 'complete', csvContent });
};

const processWorkbookSheet = async (workbook: WorkBook, sheetName: string): Promise<string> => {
  const sheet = workbook.Sheets[sheetName];
  const range = utils.decode_range(sheet['!ref'] || 'A1');
  const totalRows = range.e.r + 1;
  const CHUNK_SIZE = 1000;
  
  // Process headers
  const headerData = utils.sheet_to_json(sheet, { header: 1, range: 0 }) as any[];
  if (!headerData.length) throw new Error('No headers found in sheet');
  
  const headers = (headerData[0] as any[])
    .map(header => escapeCSVField(String(header)))
    .join(',');
  
  let csvContent = headers;
  let processedRows = 0;
  
  // Process data in chunks
  for (let startRow = 1; startRow < totalRows; startRow += CHUNK_SIZE) {
    const endRow = Math.min(startRow + CHUNK_SIZE - 1, totalRows - 1);
    
    const chunkData = utils.sheet_to_json(sheet, {
      header: 1,
      range: { s: { r: startRow, c: 0 }, e: { r: endRow, c: range.e.c } }
    }) as any[][];
    
    const chunkCsv = chunkData
      .map(row => row.map(cell => escapeCSVField(cell)).join(','))
      .join('\n');
    
    if (chunkCsv) {
      csvContent += '\n' + chunkCsv;
    }
    
    processedRows += chunkData.length;
    const progress = Math.min(100, Math.round((processedRows / totalRows) * 100));
    
    self.postMessage({ 
      type: 'progress', 
      progress,
      processedRows,
      totalRows
    });
  }
  
  return csvContent;
};

const escapeCSVField = (value: any): string => {
  if (value === null || value === undefined) return '""';
  
  const stringValue = String(value);
  
  // If the value contains quotes, commas, or newlines, it needs to be escaped
  if (stringValue.includes('"') || stringValue.includes(',') || stringValue.includes('\n')) {
    // Replace any quotes with double quotes and wrap the entire value in quotes
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  
  return stringValue;
};
