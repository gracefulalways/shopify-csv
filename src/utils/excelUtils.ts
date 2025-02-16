
import { read, utils, write, WorkBook } from 'xlsx';

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
  
  // Process headers first with proper typing
  const headerRowData = utils.sheet_to_json(sheet, { 
    header: 1,
    range: 0
  }) as any[];
  
  if (!headerRowData.length) {
    throw new Error('No header row found in the sheet');
  }

  const headers = (headerRowData[0] as any[]).map(header => 
    typeof header === 'string' ? `"${header}"` : `"${String(header)}"`
  ).join(',');
  
  // Process the rest of the data in chunks
  let csvContent = headers;
  
  // Process each chunk of rows
  for (let startRow = 1; startRow < totalRows; startRow += CHUNK_SIZE) {
    const endRow = Math.min(startRow + CHUNK_SIZE - 1, totalRows - 1);
    
    const chunkData = utils.sheet_to_json(sheet, {
      header: 1,
      range: startRow // This will start from the row we want
    }) as any[];
    
    // Convert chunk data to CSV format with proper quoting
    const chunkCsv = chunkData.map(row => {
      return (row as any[]).map(cell => {
        if (cell === null || cell === undefined) return '""';
        return `"${String(cell).replace(/"/g, '""')}"`;
      }).join(',');
    }).join('\n');
    
    if (chunkCsv.trim()) {
      csvContent += '\n' + chunkCsv;
    }
  }
  
  return csvContent;
};

export const convertCSVToExcel = (csvContent: string, fileName: string): Blob => {
  // Process CSV in chunks when converting back to Excel
  const rows = csvContent.split('\n');
  const headers = rows[0].split(',').map(header => 
    header.replace(/^"(.*)"$/, '$1').replace(/""/g, '"')
  );
  
  const chunks = [];
  for (let i = 1; i < rows.length; i += CHUNK_SIZE) {
    chunks.push(rows.slice(i, i + CHUNK_SIZE));
  }
  
  // Create worksheet with headers
  const ws = utils.aoa_to_sheet([headers]);
  
  // Process chunks
  chunks.forEach((chunk) => {
    const chunkData = chunk.map(row => 
      row.split(',').map(cell => 
        cell.replace(/^"(.*)"$/, '$1').replace(/""/g, '"')
      )
    );
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
