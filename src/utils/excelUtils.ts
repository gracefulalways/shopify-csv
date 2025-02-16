
import { read, utils, WorkBook } from 'xlsx';

interface ExcelProcessingResult {
  sheets?: string[];
  csvContent?: string;
}

const CHUNK_SIZE = 1000; // Number of rows to process at once

export const processExcelFile = (file: File): Promise<ExcelProcessingResult> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = read(data, { type: 'binary', cellDates: true });
        
        // If there are multiple sheets, return the list of sheets
        if (workbook.SheetNames.length > 1) {
          resolve({ sheets: workbook.SheetNames });
        } else {
          // If there's only one sheet, process it directly
          const csvContent = processWorkbookSheet(workbook, workbook.SheetNames[0]);
          resolve({ csvContent });
        }
      } catch (error) {
        reject(error);
      }
    };
    
    // Use readAsBinaryString for better memory efficiency
    reader.readAsBinaryString(file);
  });
};

export const processExcelSheet = (file: File, sheetName: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = read(data, { type: 'binary', cellDates: true });
        const csvContent = processWorkbookSheet(workbook, sheetName);
        resolve(csvContent);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = (error) => reject(error);
    reader.readAsBinaryString(file);
  });
};

const processWorkbookSheet = (workbook: WorkBook, sheetName: string): string => {
  const sheet = workbook.Sheets[sheetName];
  const range = utils.decode_range(sheet['!ref'] || 'A1');
  const totalRows = range.e.r + 1;
  
  // Process headers first
  const headers = utils.sheet_to_csv(sheet, {
    range: { s: { r: 0, c: 0 }, e: { r: 0, c: range.e.c } },
    FS: ',',
    RS: '\n',
    forceQuotes: true
  });
  
  // Process the rest of the data in chunks
  let csvContent = headers;
  for (let startRow = 1; startRow < totalRows; startRow += CHUNK_SIZE) {
    const endRow = Math.min(startRow + CHUNK_SIZE - 1, totalRows - 1);
    const chunkRange = {
      s: { r: startRow, c: 0 },
      e: { r: endRow, c: range.e.c }
    };
    
    const chunkCsv = utils.sheet_to_csv(sheet, {
      range: chunkRange,
      FS: ',',
      RS: '\n',
      forceQuotes: true
    });
    
    if (chunkCsv.trim()) {
      csvContent += '\n' + chunkCsv;
    }
  }
  
  return csvContent;
};

export const convertCSVToExcel = (csvContent: string, fileName: string): Blob => {
  // Process CSV in chunks when converting back to Excel
  const rows = csvContent.split('\n');
  const headers = rows[0].split(',');
  
  const chunks = [];
  for (let i = 1; i < rows.length; i += CHUNK_SIZE) {
    chunks.push(rows.slice(i, i + CHUNK_SIZE));
  }
  
  // Create worksheet with headers
  const ws = utils.aoa_to_sheet([headers]);
  
  // Process chunks
  chunks.forEach((chunk, index) => {
    const chunkData = chunk.map(row => row.split(','));
    utils.sheet_add_aoa(ws, chunkData, { origin: -1 });
  });
  
  // Create workbook and append worksheet
  const wb = utils.book_new();
  utils.book_append_sheet(wb, ws, 'Sheet1');
  
  // Generate Excel file
  const excelBuffer = write(wb, { bookType: 'xlsx', type: 'array' });
  
  return new Blob([excelBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  });
};
