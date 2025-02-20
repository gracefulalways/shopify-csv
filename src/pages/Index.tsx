
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { MappingList } from "@/components/MappingList";
import { CSVDropzone } from "@/components/CSVDropzone";
import { FieldMappingForm } from "@/components/field-mapping/FieldMappingForm";
import { useCSVProcessor } from "@/hooks/useCSVProcessor";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
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
    generateProcessedCSV,
    setFileName,
    rawCSV,
    resetFieldMapping
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
    Object.entries(mapping.mapping_config).forEach(([shopifyField, uploadedField]) => {
      handleFieldMapping(shopifyField, uploadedField as string);
    });
    setFileName(mapping.original_filename);
    const blob = new Blob([mapping.csv_content], { type: 'text/csv' });
    const file = new File([blob], mapping.original_filename, { type: 'text/csv' });
    processCSV(file, true);
  };

  const downloadProcessedFile = () => {
    const csv = generateProcessedCSV();
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const downloadFileName = fileName.replace(/\.[^/.]+$/, '') + '.csv';
    link.setAttribute('download', downloadFileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-3xl mx-auto">
        <Header user={user} />

        <div className="text-center mb-8">
          <p className="text-lg text-gray-700 leading-relaxed">
            ShopifyCSV.app makes it effortless to convert your CSV or Excel inventory files into Shopify-ready CSVs. 
            Simply upload your file, let our tool format it to meet Shopify's exact requirements, and download your ready-to-use CSV in seconds. 
            No manual edits, no hassle—just a seamless way to get your products online faster.
          </p>
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
            onSaveMapping={() => saveMappingConfiguration(user?.id, fileName, fieldMapping, rawCSV)}
            user={user}
            fileName={fileName}
          />
        </Card>

        {Object.keys(fieldMapping).length > 0 && (
          <ActionButtons
            user={user}
            onDownload={downloadProcessedFile}
            onSaveMapping={() => saveMappingConfiguration(user?.id, fileName, fieldMapping, rawCSV)}
            onResetMapping={resetFieldMapping}
          />
        )}

        <Footer />
      </div>
    </div>
  );
};

export default Index;
