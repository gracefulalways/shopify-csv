
import { write, utils } from 'xlsx';

interface ExcelProcessingResult {
  sheets?: string[];
  csvContent?: string;
}

export const processExcelFile = (file: File): Promise<ExcelProcessingResult> => {
  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL('../workers/excelWorker.ts', import.meta.url), {
      type: 'module'
    });

    worker.onmessage = (e) => {
      const { type, sheets, csvContent, progress, error } = e.data;
      
      switch (type) {
        case 'sheets':
          resolve({ sheets });
          break;
        case 'complete':
          resolve({ csvContent });
          break;
        case 'progress':
          // Dispatch progress event that can be caught by the UI
          window.dispatchEvent(new CustomEvent('excel-processing-progress', {
            detail: { progress, processedRows: e.data.processedRows, totalRows: e.data.totalRows }
          }));
          break;
        case 'error':
          reject(new Error(error));
          break;
      }
    };

    worker.onerror = (error) => {
      reject(error);
    };

    worker.postMessage({ file, action: 'processFile' });
  });
};

export const processExcelSheet = (file: File, sheetName: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL('../workers/excelWorker.ts', import.meta.url), {
      type: 'module'
    });

    worker.onmessage = (e) => {
      const { type, csvContent, error } = e.data;
      
      switch (type) {
        case 'complete':
          resolve(csvContent);
          break;
        case 'progress':
          window.dispatchEvent(new CustomEvent('excel-processing-progress', {
            detail: { progress: e.data.progress }
          }));
          break;
        case 'error':
          reject(new Error(error));
          break;
      }
    };

    worker.onerror = (error) => {
      reject(error);
    };

    worker.postMessage({ file, action: 'processSheet', sheetName });
  });
};

export const convertCSVToExcel = (csvContent: string, fileName: string): Blob => {
  const CHUNK_SIZE = 1000;
  const rows = csvContent.split('\n');
  const headers = rows[0].split(',').map(header => 
    header.replace(/^"(.*)"$/, '$1').replace(/""/g, '"')
  );
  
  // Create worksheet with headers
  const ws = utils.aoa_to_sheet([headers]);
  
  // Process data in chunks
  for (let i = 1; i < rows.length; i += CHUNK_SIZE) {
    const chunk = rows.slice(i, Math.min(i + CHUNK_SIZE, rows.length));
    const chunkData = chunk.map(row => 
      row.split(',').map(cell => 
        cell.replace(/^"(.*)"$/, '$1').replace(/""/g, '"')
      )
    );
    utils.sheet_add_aoa(ws, chunkData, { origin: -1 });
  }
  
  // Create workbook and append worksheet
  const wb = utils.book_new();
  utils.book_append_sheet(wb, ws, 'Sheet1');
  
  // Generate Excel file
  const excelBuffer = write(wb, { bookType: 'xlsx', type: 'array' });
  
  return new Blob([excelBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  });
};
