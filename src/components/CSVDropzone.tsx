
import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface CSVDropzoneProps {
  onFileProcess: (file: File) => void;
  isProcessing: boolean;
  progress: number;
}

export const CSVDropzone = ({ onFileProcess, isProcessing, progress }: CSVDropzoneProps) => {
  const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      if (file.size > MAX_FILE_SIZE) {
        alert(`File is too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB`);
        return;
      }
      onFileProcess(file);
    }
  }, [onFileProcess]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls']
    },
    maxFiles: 1,
    maxSize: MAX_FILE_SIZE
  });

  return (
    <div className="mb-6">
      <h2 className="text-xl font-semibold mb-2">Upload Your File</h2>
      <Alert variant="default" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Maximum file size: 50MB. Large files will be processed in chunks for better performance.
        </AlertDescription>
      </Alert>
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary'}`}
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p className="text-lg">Drop the file here...</p>
        ) : (
          <div>
            <p className="text-lg mb-2">Drag & drop a file here, or click to select</p>
            <p className="text-sm text-gray-500">Accepts .csv, .xlsx, and .xls files</p>
          </div>
        )}
      </div>

      {isProcessing && (
        <div className="mt-6">
          <p className="text-sm font-medium mb-2">Processing file...</p>
          <Progress value={progress} className="h-2" />
        </div>
      )}
    </div>
  );
};
