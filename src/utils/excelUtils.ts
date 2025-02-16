
import { read, utils, write } from 'xlsx';

interface ExcelProcessingResult {
  sheets?: string[];
  csvContent?: string;
}

export const processExcelFile = (file: File): Promise<ExcelProcessingResult> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = read(data, { type: 'binary' });
        
        // If there are multiple sheets, return the list of sheets
        if (workbook.SheetNames.length > 1) {
          resolve({ sheets: workbook.SheetNames });
        } else {
          // If there's only one sheet, process it directly
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const csvContent = utils.sheet_to_csv(firstSheet);
          resolve({ csvContent });
        }
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = (error) => reject(error);
    reader.readAsBinaryString(file);
  });
};

export const processExcelSheet = (file: File, sheetName: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = read(data, { type: 'binary' });
        const sheet = workbook.Sheets[sheetName];
        const csvContent = utils.sheet_to_csv(sheet);
        resolve(csvContent);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = (error) => reject(error);
    reader.readAsBinaryString(file);
  });
};

export const convertCSVToExcel = (csvContent: string, fileName: string): Blob => {
  // Parse CSV to array of arrays
  const rows = csvContent.split('\n').map(row => row.split(','));
  
  // Create worksheet
  const ws = utils.aoa_to_sheet(rows);
  
  // Create workbook and append worksheet
  const wb = utils.book_new();
  utils.book_append_sheet(wb, ws, 'Sheet1');
  
  // Generate Excel file as array buffer
  const excelBuffer = write(wb, { bookType: 'xlsx', type: 'array' });
  
  // Convert to Blob
  return new Blob([excelBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  });
};
