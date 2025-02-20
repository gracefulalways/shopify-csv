
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ProfileSettingsProps {
  email: string;
  setEmail: (email: string) => void;
  newPassword: string;
  setNewPassword: (password: string) => void;
}

export const ProfileSettings = ({ 
  email, 
  setEmail, 
  newPassword, 
  setNewPassword 
}: ProfileSettingsProps) => {
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

  return (
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
  );
};
