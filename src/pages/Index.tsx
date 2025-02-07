import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { MappingList } from "@/components/MappingList";
import { CSVDropzone } from "@/components/CSVDropzone";
import { FieldMappingForm } from "@/components/FieldMappingForm";
import { useCSVProcessor } from "@/hooks/useCSVProcessor";
import { SaveIcon } from "lucide-react";

const Index = () => {
  const [user, setUser] = useState<any>(null);
  const {
    progress,
    isProcessing,
    uploadedHeaders,
    fieldMapping,
    isAutoMapped,
    fileName,
    shopifyFields,
    processCSV,
    handleFieldMapping,
    saveMappingConfiguration,
    generateProcessedCSV
  } = useCSVProcessor();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleMappingSelect = (mapping: any) => {
    setFieldMapping(mapping.mapping_config);
    setFileName(mapping.original_filename);
  };

  const downloadProcessedFile = () => {
    const csv = generateProcessedCSV();
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
            onSaveMapping={() => user && saveMappingConfiguration(user.id)}
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
              onClick={() => user && saveMappingConfiguration(user.id)}
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
