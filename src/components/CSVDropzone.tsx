
import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Progress } from "@/components/ui/progress";

interface CSVDropzoneProps {
  onFileProcess: (file: File) => void;
  isProcessing: boolean;
  progress: number;
}

export const CSVDropzone = ({ onFileProcess, isProcessing, progress }: CSVDropzoneProps) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      onFileProcess(file);
    }
  }, [onFileProcess]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv']
    },
    maxFiles: 1
  });

  return (
    <div className="mb-6">
      <h2 className="text-xl font-semibold mb-2">Upload Your CSV</h2>
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary'}`}
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p className="text-lg">Drop the CSV file here...</p>
        ) : (
          <div>
            <p className="text-lg mb-2">Drag & drop a CSV file here, or click to select</p>
            <p className="text-sm text-gray-500">Only .csv files are accepted</p>
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
