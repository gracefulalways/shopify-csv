
import { convertCSVToExcel } from "./excelUtils";

export const downloadProcessedFile = (csv: string, fileName: string) => {
  const isExcel = fileName.toLowerCase().endsWith('.xlsx');

  if (isExcel) {
    // Convert to Excel and download
    const excelBlob = convertCSVToExcel(csv, fileName);
    downloadBlob(excelBlob, fileName);
  } else {
    // Download as CSV
    const blob = new Blob([csv], { type: 'text/csv' });
    downloadBlob(blob, fileName);
  }
};

const downloadBlob = (blob: Blob, fileName: string) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};
