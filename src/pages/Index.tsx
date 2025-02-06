
import { useCallback, useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";

interface FieldMapping {
  [key: string]: string;
}

const Index = () => {
  const [progress, setProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedHeaders, setUploadedHeaders] = useState<string[]>([]);
  const [fieldMapping, setFieldMapping] = useState<FieldMapping>({});
  const [csvData, setCsvData] = useState<any[]>([]);
  const [isAutoMapped, setIsAutoMapped] = useState(false);

  // Shopify required fields based on their template
  const shopifyFields = [
    "Handle",
    "Title",
    "Body (HTML)",
    "Vendor",
    "Product Category",
    "Type",
    "Tags",
    "Published",
    "Option1 Name",
    "Option1 Value",
    "Variant SKU",
    "Variant Price",
    "Variant Compare At Price",
    "Variant Inventory Tracker",
    "Variant Inventory Quantity",
    "Variant Weight",
    "Variant Weight Unit",
    "Image Src",
    "Status"
  ];

  const autoMapFields = (headers: string[]) => {
    const newMapping: FieldMapping = {};
    
    shopifyFields.forEach(shopifyField => {
      // Convert both strings to lowercase for better matching
      const shopifyFieldLower = shopifyField.toLowerCase();
      
      // Try to find exact match first
      let match = headers.find(header => 
        header.toLowerCase() === shopifyFieldLower
      );
      
      // If no exact match, try partial matches
      if (!match) {
        match = headers.find(header => {
          const headerLower = header.toLowerCase();
          // Remove common words and check if the header contains the shopify field or vice versa
          const cleanShopifyField = shopifyFieldLower.replace(/variant |option\d+ /g, '');
          const cleanHeader = headerLower.replace(/variant |option\d+ /g, '');
          return cleanHeader.includes(cleanShopifyField) || cleanShopifyField.includes(cleanHeader);
        });
      }
      
      if (match) {
        newMapping[shopifyField] = match;
      }
    });

    return newMapping;
  };

  const processCSV = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n');
      const headers = lines[0].split(',').map(header => header.trim());
      setUploadedHeaders(headers);
      
      // Parse CSV data
      const data = lines.slice(1).map(line => {
        const values = line.split(',');
        return headers.reduce((obj: any, header, index) => {
          obj[header] = values[index];
          return obj;
        }, {});
      });
      setCsvData(data);

      // Auto map fields and show toast notification
      const autoMapped = autoMapFields(headers);
      setFieldMapping(autoMapped);
      setIsAutoMapped(true);
      
      toast({
        title: "Fields Auto-Mapped",
        description: "Please review the field mappings and adjust if needed before downloading.",
      });
    };
    reader.readAsText(file);
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setIsProcessing(true);
      setProgress(0);
      processCSV(file);
      
      let currentProgress = 0;
      const interval = setInterval(() => {
        currentProgress += 10;
        setProgress(currentProgress);
        
        if (currentProgress >= 100) {
          clearInterval(interval);
          setIsProcessing(false);
        }
      }, 500);
    }
  }, []);

  const handleFieldMapping = (shopifyField: string, uploadedField: string) => {
    setFieldMapping(prev => ({
      ...prev,
      [shopifyField]: uploadedField
    }));
  };

  const downloadProcessedFile = () => {
    // Process data according to mapping
    const processedData = csvData.map(row => {
      const processedRow: { [key: string]: string } = {};
      shopifyFields.forEach(shopifyField => {
        processedRow[shopifyField] = row[fieldMapping[shopifyField]] || '';
      });
      return processedRow;
    });

    // Convert to CSV
    const csv = [
      shopifyFields.join(','),
      ...processedData.map(row => shopifyFields.map(field => row[field]).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'processed_shopify_products.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
        
        <Card className="p-6 mb-6">
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
          </div>

          {isProcessing && (
            <div className="mb-6">
              <p className="text-sm font-medium mb-2">Processing file...</p>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          {isAutoMapped && uploadedHeaders.length > 0 && (
            <Alert className="mb-6">
              <InfoIcon className="h-4 w-4" />
              <AlertDescription>
                Fields have been automatically mapped. Please review the mappings below and adjust if needed before downloading the processed file.
              </AlertDescription>
            </Alert>
          )}

          {uploadedHeaders.length > 0 && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-4">Review Field Mappings</h2>
              <div className="grid gap-4">
                {shopifyFields.map((shopifyField) => (
                  <div key={shopifyField} className="flex items-center gap-4">
                    <span className="w-1/3 text-sm font-medium">{shopifyField}</span>
                    <Select
                      value={fieldMapping[shopifyField]}
                      onValueChange={(value) => handleFieldMapping(shopifyField, value)}
                    >
                      <SelectTrigger className="w-2/3">
                        <SelectValue placeholder="Select field..." />
                      </SelectTrigger>
                      <SelectContent>
                        {uploadedHeaders.map((header) => (
                          <SelectItem key={header} value={header}>
                            {header}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            </div>
          )}

          {Object.keys(fieldMapping).length > 0 && (
            <div className="mt-6 flex justify-center">
              <Button onClick={downloadProcessedFile}>
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
