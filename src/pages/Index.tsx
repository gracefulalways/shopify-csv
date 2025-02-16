
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
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";

const Index = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
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
    rawCSV
  } = useCSVProcessor();

  useEffect(() => {
    // Initial session check
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        setUser(session?.user ?? null);
        if (!session?.user) {
          // Only redirect if we're sure there's no session
          navigate('/auth');
        }
      } catch (error: any) {
        console.error('Error checking session:', error.message);
        toast({
          title: "Authentication Error",
          description: "Please try signing in again.",
          variant: "destructive",
        });
        navigate('/auth');
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      if (!session?.user) {
        navigate('/auth');
      }
    });

    // Cleanup subscription
    return () => {
      subscription.unsubscribe();
    };
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

  const downloadProcessedFile = () => {
    const csv = generateProcessedCSV();
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    // Always use .csv extension for the downloaded file
    const downloadFileName = fileName.replace(/\.[^/.]+$/, '') + '.csv';
    link.setAttribute('download', downloadFileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">
      <p>Loading...</p>
    </div>;
  }

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
            onDownload={downloadProcessedFile}
            onSaveMapping={() => saveMappingConfiguration(user?.id, fileName, fieldMapping, rawCSV)}
          />
        )}

        <Footer />
      </div>
    </div>
  );
};

export default Index;
