
export const processExcelFile = (file: File): Promise<{
  headers: string[];
  chunks: string[];
  totalRows: number;
}> => {
  return new Promise((resolve, reject) => {
    // File size check (10MB warning threshold)
    const MAX_SIZE_WITHOUT_WARNING = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_SIZE_WITHOUT_WARNING) {
      console.warn(`Large file detected (${(file.size / 1024 / 1024).toFixed(2)}MB). Processing may take longer.`);
    }

    const worker = new Worker(
      new URL('../workers/excelWorker.ts', import.meta.url),
      { type: 'module' }
    );

    const chunks: string[] = [];
    let headers: string[] = [];

    worker.onmessage = (e) => {
      const { type, data, progress, error, headers: receivedHeaders } = e.data;

      switch (type) {
        case 'headers':
          headers = receivedHeaders;
          break;
        case 'chunk':
          chunks.push(data);
          break;
        case 'complete':
          worker.terminate();
          resolve({ headers, chunks, totalRows: chunks.length });
          break;
        case 'error':
          worker.terminate();
          reject(new Error(error));
          break;
      }
    };

    worker.onerror = (error) => {
      worker.terminate();
      reject(error);
    };

    // Read file as base64
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = (e.target?.result as string).split(',')[1];
      worker.postMessage({
        fileData: base64,
        type: file.type
      });
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};
