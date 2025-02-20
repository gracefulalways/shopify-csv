
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger 
} from "@/components/ui/tooltip";
import { HelpCircle } from "lucide-react";

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

        <div className="grid grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Email Address</label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="w-64">Your email is used for account verification and important notifications. Changing it requires re-verification.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="space-y-2">
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email"
                className="w-full"
              />
              <Button 
                onClick={handleUpdateEmail}
                className="w-full"
              >
                Update Email
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              This email will be used for account-related notifications
            </p>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Change Password</label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="w-64">Choose a strong password with at least 8 characters, including numbers and special characters.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="space-y-2">
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                className="w-full"
              />
              <Button 
                onClick={handleUpdatePassword}
                className="w-full"
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
