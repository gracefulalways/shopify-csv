
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { MappingList } from "@/components/MappingList";
import { CSVDropzone } from "@/components/CSVDropzone";
import { FieldMappingForm } from "@/components/FieldMappingForm";
import { useCSVProcessor } from "@/hooks/useCSVProcessor";
import { Header } from "@/components/Header";
import { ActionButtons } from "@/components/ActionButtons";

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
    handleFieldMapping(mapping.mapping_config);
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
        <Header user={user} />

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

        {Object.keys(fieldMapping).length > 0 && (
          <ActionButtons
            user={user}
            onDownload={downloadProcessedFile}
            onSaveMapping={() => user && saveMappingConfiguration(user.id)}
          />
        )}
      </div>
    </div>
  );
};

export default Index;
