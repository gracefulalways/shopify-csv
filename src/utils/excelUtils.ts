
import { read, utils, write } from 'xlsx';

export const processExcelFile = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = read(data, { type: 'binary' });
        
        // Get first sheet
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        
        // Convert to CSV
        const csvContent = utils.sheet_to_csv(firstSheet);
        
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
