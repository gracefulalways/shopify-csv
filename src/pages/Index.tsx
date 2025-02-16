
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { MappingList } from "@/components/MappingList";
import { CSVDropzone } from "@/components/CSVDropzone";
import { FieldMappingForm } from "@/components/FieldMappingForm";
import { useCSVProcessor } from "@/hooks/useCSVProcessor";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ActionButtons } from "@/components/ActionButtons";
import { VendorFilter } from "@/components/VendorFilter";
import { SheetSelector } from "@/components/SheetSelector";

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
    getUniqueVendors,
    getProductCountByVendor,
    selectedVendors,
    setSelectedVendors,
    vendorFilterField,
    handleVendorFilterMapping,
    showSheetSelector,
    availableSheets,
    handleSheetSelect
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
    // Create a file from the CSV content and process it
    const blob = new Blob([mapping.csv_content], { type: 'text/csv' });
    const file = new File([blob], mapping.original_filename, { type: 'text/csv' });
    processCSV(file, true); // Pass true to skip upload since we're loading an existing file
  };

  const downloadProcessedFile = () => {
    const csv = generateProcessedCSV();
    // Ensure proper CSV MIME type
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    // Always use .csv extension for the output file
    const baseFileName = fileName.replace(/\.[^/.]+$/, ""); // Remove any existing extension
    const downloadFileName = `${baseFileName}.csv`;
    
    link.setAttribute('download', downloadFileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url); // Clean up the URL object
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
            onSaveMapping={() => saveMappingConfiguration(user?.id, fileName, fieldMapping, rawCSV)}
            user={user}
          />

          <div className="mt-6">
            <VendorFilter
              vendors={getUniqueVendors()}
              selectedVendors={selectedVendors}
              onVendorSelection={setSelectedVendors}
              productCountByVendor={getProductCountByVendor()}
              uploadedHeaders={uploadedHeaders}
              vendorFilterField={vendorFilterField}
              onVendorFilterMapping={handleVendorFilterMapping}
            />
          </div>
        </Card>

        {Object.keys(fieldMapping).length > 0 && (
          <ActionButtons
            user={user}
            onDownload={downloadProcessedFile}
            onSaveMapping={() => saveMappingConfiguration(user?.id, fileName, fieldMapping, rawCSV)}
          />
        )}

        <SheetSelector
          sheets={availableSheets}
          onSheetSelect={handleSheetSelect}
          isOpen={showSheetSelector}
        />

        <Footer />
      </div>
    </div>
  );
};

export default Index;
