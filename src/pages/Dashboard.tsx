
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { MappingList } from "@/components/MappingList";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [openAIKey, setOpenAIKey] = useState("");
  const [hasOpenAIKey, setHasOpenAIKey] = useState(false);
  const [processingAPI, setProcessingAPI] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }
      setUser(user);
      setEmail(user.email || "");
      setLoading(false);
      
      // Check if user has OpenAI key stored
      checkOpenAIKey();
    };

    getUser();
  }, [navigate]);

  const checkOpenAIKey = async () => {
    try {
      const { data: { exists } } = await supabase.functions.invoke('manage-api-key', {
        body: { action: 'check', key_type: 'openai' }
      });
      setHasOpenAIKey(exists);
    } catch (error: any) {
      console.error('Error checking OpenAI key:', error);
    }
  };

  const handleUpdateEmail = async () => {
    try {
      const { error } = await supabase.auth.updateUser({ email });
      if (error) throw error;
      toast({
        title: "Success",
        description: "Email updated successfully. Please check your new email for verification.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleUpdatePassword = async () => {
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      setNewPassword("");
      toast({
        title: "Success",
        description: "Password updated successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

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

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Profile Settings</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Email Address</label>
              <div className="flex gap-2">
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email"
                />
                <Button onClick={handleUpdateEmail}>Update Email</Button>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Change Password</label>
              <div className="flex gap-2">
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="New password"
                />
                <Button onClick={handleUpdatePassword}>Update Password</Button>
              </div>
            </div>
          </div>
        </Card>

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

        <Card className="p-6">
          <MappingList onSelect={() => {}} />
        </Card>

        <div className="flex justify-end">
          <Button
            variant="outline"
            onClick={() => navigate("/")}
          >
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
