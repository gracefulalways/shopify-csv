import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { MappingList } from "@/components/MappingList";
import { CSVDropzone } from "@/components/CSVDropzone";
import { FieldMappingForm } from "@/components/FieldMappingForm";

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
  const [user, setUser] = useState<any>(null);
  const [fileName, setFileName] = useState<string>("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

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
    setIsProcessing(true);
    setProgress(0);
    
    const reader = new FileReader();
    setFileName(`ShopifyCSV-${file.name}`);
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n');
      const headers = lines[0].split(',').map(header => header.trim());
      setUploadedHeaders(headers);
      
      const data = lines.slice(1).map(line => {
        const values = line.split(',');
        return headers.reduce((obj: any, header, index) => {
          obj[header] = values[index];
          return obj;
        }, {});
      });
      setCsvData(data);

      const autoMapped = autoMapFields(headers);
      setFieldMapping(autoMapped);
      setIsAutoMapped(true);
      
      toast({
        title: "Fields Auto-Mapped",
        description: "Please review the field mappings and adjust if needed before downloading.",
      });
    };
    reader.readAsText(file);
    
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += 10;
      setProgress(currentProgress);
      
      if (currentProgress >= 100) {
        clearInterval(interval);
        setIsProcessing(false);
      }
    }, 500);
  };

  const handleFieldMapping = (shopifyField: string, uploadedField: string) => {
    setFieldMapping(prev => ({
      ...prev,
      [shopifyField]: uploadedField
    }));
  };

  const saveMappingConfiguration = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to save your mapping configuration.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('mapping_history')
        .insert({
          user_id: user.id,
          original_filename: fileName,
          mapping_config: fieldMapping,
          is_deleted: false
        });

      if (error) {
        if (error.message.includes('upgrade to save more files')) {
          toast({
            title: "File Limit Reached",
            description: "Free users can only save up to 3 files. Please upgrade to save more files.",
            variant: "destructive",
          });
        } else {
          throw error;
        }
        return;
      }

      toast({
        title: "Success",
        description: "Mapping configuration saved successfully!",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to save mapping configuration: " + error.message,
        variant: "destructive",
      });
    }
  };

  const handleMappingSelect = (mapping: any) => {
    setFieldMapping(mapping.mapping_config);
    setFileName(mapping.original_filename);
    toast({
      title: "Mapping Loaded",
      description: "The selected mapping configuration has been loaded.",
    });
  };

  const downloadProcessedFile = () => {
    const processedData = csvData.map(row => {
      const processedRow: { [key: string]: string } = {};
      shopifyFields.forEach(shopifyField => {
        processedRow[shopifyField] = row[fieldMapping[shopifyField]] || '';
      });
      return processedRow;
    });

    const csv = [
      shopifyFields.join(','),
      ...processedData.map(row => shopifyFields.map(field => row[field]).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">CSV Processor for Shopify</h1>
          {!user ? (
            <Button
              variant="outline"
              onClick={() => window.location.href = '/auth'}
            >
              Sign in to Save Mappings
            </Button>
          ) : (
            <Button
              variant="outline"
              onClick={() => supabase.auth.signOut()}
            >
              Sign Out
            </Button>
          )}
        </div>

        {user && (
          <Card className="p-6 mb-6">
            <MappingList onSelect={handleMappingSelect} />
          </Card>
        )}
        
        <Card className="p-6 mb-6">
          <CSVDropzone
            onFileProcess={processCSV}
            isProcessing={isProcessing}
            progress={progress}
          />

          <FieldMappingForm
            isAutoMapped={isAutoMapped}
            uploadedHeaders={uploadedHeaders}
            shopifyFields={shopifyFields}
            fieldMapping={fieldMapping}
            onFieldMapping={handleFieldMapping}
            onSaveMapping={saveMappingConfiguration}
            user={user}
          />
        </Card>

        {Object.keys(fieldMapping).length > 0 && user && (
          <div className="mt-6 flex justify-center gap-4">
            <Button onClick={downloadProcessedFile}>
              Download Processed File
            </Button>
            <Button
              variant="outline"
              onClick={saveMappingConfiguration}
              className="flex items-center gap-2"
            >
              <SaveIcon className="h-4 w-4" />
              Save Mapping
            </Button>
          </div>
        )}

        {Object.keys(fieldMapping).length > 0 && !user && (
          <div className="mt-6 flex justify-center">
            <Button onClick={downloadProcessedFile}>
              Download Processed File
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
