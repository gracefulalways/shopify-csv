
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";

const Index = () => {
  const [progress, setProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setIsProcessing(true);
      setProgress(0);
      
      // Simulate file processing with progress
      let currentProgress = 0;
      const interval = setInterval(() => {
        currentProgress += 10;
        setProgress(currentProgress);
        
        if (currentProgress >= 100) {
          clearInterval(interval);
          setIsProcessing(false);
          toast({
            title: "Processing Complete",
            description: "Your file has been processed successfully!"
          });
        }
      }, 500);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv']
    },
    maxFiles: 1
  });

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">CSV Processor for Shopify</h1>
        
        <Card className="p-6">
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

          {progress === 100 && (
            <div className="mt-6 flex justify-center">
              <Button>
                Download Processed File
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Index;
