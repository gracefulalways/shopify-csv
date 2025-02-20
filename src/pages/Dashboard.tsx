
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { MappingList } from "@/components/MappingList";
import { SettingsHeader } from "@/components/settings/SettingsHeader";
import { ProfileSettings } from "@/components/settings/ProfileSettings";
import { AISettings } from "@/components/settings/AISettings";
import { Footer } from "@/components/Footer";

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

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-3xl mx-auto space-y-6">
        <SettingsHeader onBackClick={() => navigate("/")} />
        
        <ProfileSettings 
          email={email}
          setEmail={setEmail}
          newPassword={newPassword}
          setNewPassword={setNewPassword}
        />

        <AISettings 
          openAIKey={openAIKey}
          setOpenAIKey={setOpenAIKey}
          hasOpenAIKey={hasOpenAIKey}
          setHasOpenAIKey={setHasOpenAIKey}
          processingAPI={processingAPI}
          setProcessingAPI={setProcessingAPI}
        />

        <Card className="p-6">
          <MappingList onSelect={() => {}} />
        </Card>

        <Footer />
      </div>
    </div>
  );
};

export default Dashboard;
