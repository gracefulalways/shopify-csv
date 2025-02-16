
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
import { SheetSelector } from "@/components/SheetSelector";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();
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
    availableSheets,
    showSheetSelector,
    setShowSheetSelector,
    handleSheetSelect,
    downloadFile
  } = useCSVProcessor();

  useEffect(() => {
    // Check authentication status on mount
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
    };
    checkAuth();

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const newUser = session?.user ?? null;
      setUser(newUser);
      
      if (!newUser) {
        // If user signed out, redirect to auth page
        navigate('/auth');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

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

  // Protected route - if no user, redirect to auth
  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

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
        </Card>

        {Object.keys(fieldMapping).length > 0 && (
          <ActionButtons
            user={user}
            onDownload={downloadFile}
            onSaveMapping={() => saveMappingConfiguration(user?.id, fileName, fieldMapping, rawCSV)}
          />
        )}

        <SheetSelector
          sheets={availableSheets}
          isOpen={showSheetSelector}
          onClose={() => setShowSheetSelector(false)}
          onSheetSelect={handleSheetSelect}
        />

        <Footer />
      </div>
    </div>
  );
};

export default Index;
