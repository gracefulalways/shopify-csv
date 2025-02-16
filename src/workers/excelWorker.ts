
import { read, utils } from 'xlsx';

// Process Excel file in chunks
const CHUNK_SIZE = 1000; // Number of rows to process at once

self.onmessage = async (e: MessageEvent) => {
  try {
    const file = e.data;
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const data = event.target?.result;
        const workbook = read(data, { type: 'binary' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        
        // Convert to array of rows
        const rows = utils.sheet_to_json<string[]>(firstSheet, { header: 1 });
        const totalRows = rows.length;
        
        // Process in chunks
        let processedRows = 0;
        let csvContent = '';

        // Process headers first
        if (rows.length > 0) {
          csvContent += rows[0].map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',') + '\n';
          processedRows = 1;
          self.postMessage({ type: 'progress', progress: (processedRows / totalRows) * 100 });
        }

        // Process the rest in chunks
        for (let i = 1; i < rows.length; i += CHUNK_SIZE) {
          const chunk = rows.slice(i, i + CHUNK_SIZE);
          const chunkCsv = chunk
            .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
            .join('\n');
          
          csvContent += chunkCsv + '\n';
          processedRows += chunk.length;
          
          // Report progress
          self.postMessage({ type: 'progress', progress: (processedRows / totalRows) * 100 });
        }

        self.postMessage({ type: 'complete', data: csvContent });
      } catch (error) {
        self.postMessage({ type: 'error', error: 'Failed to process Excel file' });
      }
    };

    reader.onerror = () => {
      self.postMessage({ type: 'error', error: 'Failed to read file' });
    };

    reader.readAsBinaryString(file);
  } catch (error) {
    self.postMessage({ type: 'error', error: 'Failed to process file' });
  }
};
