
import { toast } from "@/components/ui/use-toast";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const WARNING_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export const processExcelFile = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: "File Too Large",
        description: "Please upload a file smaller than 10MB",
        variant: "destructive",
      });
      reject(new Error('File too large'));
      return;
    }

    if (file.size > WARNING_FILE_SIZE) {
      toast({
        title: "Large File Warning",
        description: "This file may take a few moments to process. Please be patient.",
        duration: 5000,
      });
    }

    // Create worker
    const worker = new Worker(new URL('../workers/excelWorker.ts', import.meta.url), {
      type: 'module'
    });

    worker.onmessage = (e) => {
      const { type, data, progress, error } = e.data;

      switch (type) {
        case 'progress':
          // Update progress through the existing progress state
          break;
        case 'complete':
          worker.terminate();
          resolve(data);
          break;
        case 'error':
          worker.terminate();
          toast({
            title: "Processing Error",
            description: error || "Failed to process Excel file",
            variant: "destructive",
          });
          reject(new Error(error));
          break;
      }
    };

    worker.onerror = (error) => {
      worker.terminate();
      toast({
        title: "Processing Error",
        description: "Failed to process Excel file",
        variant: "destructive",
      });
      reject(error);
    };

    // Start processing
    worker.postMessage(file);
  });
};
