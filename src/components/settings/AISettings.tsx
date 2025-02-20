
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Brain, ExternalLink } from "lucide-react";

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
      <div className="space-y-6">
        <div className="border-b pb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Brain className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold leading-none mb-1">AI Configuration</h2>
              <p className="text-sm text-muted-foreground">
                Enhance your product management with AI-powered features
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="grid gap-4">
            <h3 className="font-medium">Features Enabled with OpenAI Integration:</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <div className="h-5 w-5 flex-shrink-0">•</div>
                <span>
                  <strong>Automatic Field Mapping:</strong> AI analyzes your CSV headers and intelligently matches them to Shopify fields
                </span>
              </li>
              <li className="flex items-start gap-2">
                <div className="h-5 w-5 flex-shrink-0">•</div>
                <span>
                  <strong>Smart Product Descriptions:</strong> Generate professional product descriptions automatically
                </span>
              </li>
              <li className="flex items-start gap-2">
                <div className="h-5 w-5 flex-shrink-0">•</div>
                <span>
                  <strong>Category Suggestions:</strong> Get AI-powered category recommendations for your products
                </span>
              </li>
              <li className="flex items-start gap-2">
                <div className="h-5 w-5 flex-shrink-0">•</div>
                <span>
                  <strong>SEO Optimization:</strong> Generate optimized search terms and tags
                </span>
              </li>
            </ul>
          </div>

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
                <div className="space-y-4">
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
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <span>Don't have an API key?</span>
                    <a
                      href="https://platform.openai.com/api-keys"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-primary hover:underline"
                    >
                      Get one here
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              )}
              <p className="text-sm text-muted-foreground mt-2">
                Your API key is stored securely and used only for the features listed above
              </p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
