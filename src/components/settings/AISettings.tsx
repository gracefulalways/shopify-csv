
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface AISettingsProps {
  openAIKey: string;
  setOpenAIKey: (key: string) => void;
  hasOpenAIKey: boolean;
  setHasOpenAIKey: (has: boolean) => void;
  processingAPI: boolean;
  setProcessingAPI: (processing: boolean) => void;
}

export const AISettings = ({ 
  openAIKey, 
  setOpenAIKey, 
  hasOpenAIKey, 
  setHasOpenAIKey,
  processingAPI,
  setProcessingAPI
}: AISettingsProps) => {
  const handleUpdateOpenAIKey = async () => {
    setProcessingAPI(true);
    try {
      const { error } = await supabase.functions.invoke('manage-api-key', {
        body: { 
          action: 'store',
          key_type: 'openai',
          api_key: openAIKey
        }
      });
      
      if (error) throw error;
      
      setOpenAIKey("");
      setHasOpenAIKey(true);
      toast({
        title: "Success",
        description: "OpenAI API key stored successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setProcessingAPI(false);
    }
  };

  const handleDeleteOpenAIKey = async () => {
    setProcessingAPI(true);
    try {
      const { error } = await supabase.functions.invoke('manage-api-key', {
        body: { 
          action: 'delete',
          key_type: 'openai'
        }
      });
      
      if (error) throw error;
      
      setHasOpenAIKey(false);
      toast({
        title: "Success",
        description: "OpenAI API key deleted successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setProcessingAPI(false);
    }
  };

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">AI Configuration</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">OpenAI API Key</label>
          {hasOpenAIKey ? (
            <div className="flex gap-2">
              <div className="flex-1 bg-gray-100 rounded p-2">
                API key is stored securely
              </div>
              <Button 
                variant="destructive" 
                onClick={handleDeleteOpenAIKey}
                disabled={processingAPI}
              >
                Delete Key
              </Button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Input
                type="password"
                value={openAIKey}
                onChange={(e) => setOpenAIKey(e.target.value)}
                placeholder="Enter your OpenAI API key"
              />
              <Button 
                onClick={handleUpdateOpenAIKey}
                disabled={!openAIKey || processingAPI}
              >
                Save Key
              </Button>
            </div>
          )}
          <p className="text-sm text-gray-500 mt-2">
            Your API key is stored securely and used for AI-powered features.
          </p>
        </div>
      </div>
    </Card>
  );
};
