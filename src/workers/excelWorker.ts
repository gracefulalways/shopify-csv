
import { read, utils } from 'xlsx';

// Define chunk size (number of rows to process at once)
const CHUNK_SIZE = 1000;

self.onmessage = async (e: MessageEvent) => {
  try {
    const { fileData, type } = e.data;
    
    // Convert base64 to array buffer
    const binaryString = atob(fileData);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    // Read workbook
    const workbook = read(bytes.buffer, { type: 'array' });
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
    
    // Get total rows for progress calculation
    const range = utils.decode_range(firstSheet['!ref'] || 'A1');
    const totalRows = range.e.r + 1;
    
    // Convert to array of rows
    const data = utils.sheet_to_json<string[]>(firstSheet, { header: 1 });
    const headers = data[0];
    
    // Send headers immediately
    self.postMessage({ type: 'headers', headers });
    
    // Process rows in chunks
    for (let i = 1; i < data.length; i += CHUNK_SIZE) {
      const chunk = data.slice(i, i + CHUNK_SIZE);
      const progress = Math.min(Math.round((i / totalRows) * 100), 99);
      
      // Convert chunk to CSV format
      const csvChunk = chunk.map(row => {
        return row.map(cell => {
          if (cell === null || cell === undefined) return '';
          return `"${String(cell).replace(/"/g, '""')}"`;
        }).join(',');
      }).join('\n');
      
      self.postMessage({
        type: 'chunk',
        data: csvChunk,
        progress,
        totalProcessed: i,
        totalRows
      });
      
      // Small delay to prevent UI blocking
      await new Promise(resolve => setTimeout(resolve, 0));
    }
    
    self.postMessage({ type: 'complete', progress: 100 });
  } catch (error) {
    self.postMessage({ 
      type: 'error', 
      error: error instanceof Error ? error.message : 'Unknown error processing file' 
    });
  }
};

export {};
