
import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Progress } from "@/components/ui/progress";
import { AlertCircle } from "lucide-react";

interface CSVDropzoneProps {
  onFileProcess: (file: File) => void;
  isProcessing: boolean;
  progress: number;
}

export const CSVDropzone = ({ onFileProcess, isProcessing, progress }: CSVDropzoneProps) => {
  const maxSize = 10 * 1024 * 1024; // 10MB

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      onFileProcess(file);
    }
  }, [onFileProcess]);

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls']
    },
    maxFiles: 1,
    maxSize
  });

  return (
    <div className="mb-6">
      <h2 className="text-xl font-semibold mb-2">Upload Your File</h2>
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
            <p className="text-sm text-gray-500">Accepts .csv, .xlsx, and .xls files up to 10MB</p>
          </div>
        )}
      </div>

      {fileRejections.length > 0 && (
        <div className="mt-4 p-4 bg-destructive/10 rounded-lg flex items-start gap-2">
          <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
          <div>
            <p className="font-medium text-destructive">File cannot be uploaded:</p>
            <ul className="list-disc list-inside text-sm text-destructive">
              {fileRejections.map(({ errors }) =>
                errors.map((error) => (
                  <li key={error.code}>{error.message}</li>
                ))
              )}
            </ul>
          </div>
        </div>
      )}

      {isProcessing && (
        <div className="mt-6">
          <p className="text-sm font-medium mb-2">
            Processing file... {Math.round(progress)}%
          </p>
          <Progress value={progress} className="h-2" />
        </div>
      )}
    </div>
  );
};
