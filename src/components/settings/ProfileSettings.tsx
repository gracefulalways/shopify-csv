
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
      <div className="space-y-6">
        <div className="flex items-center gap-3 border-b pb-4">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <svg
              className="h-5 w-5 text-primary"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-semibold">Profile Settings</h2>
            <p className="text-sm text-muted-foreground">
              Manage your email and password settings
            </p>
          </div>
        </div>

        <div className="grid gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Email Address</label>
            <div className="flex gap-3">
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email"
                className="flex-1"
              />
              <Button 
                onClick={handleUpdateEmail}
                className="min-w-[120px]"
              >
                Update Email
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              This email will be used for account-related notifications
            </p>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Change Password</label>
            <div className="flex gap-3">
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                className="flex-1"
              />
              <Button 
                onClick={handleUpdatePassword}
                className="min-w-[120px]"
              >
                Update Password
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Choose a strong password to secure your account
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
};
