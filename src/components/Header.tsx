
import { Button } from "@/components/ui/button";
import { Package } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface HeaderProps {
  user: any;
}

export const Header = ({ user }: HeaderProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Navigate to auth page after successful sign out
      navigate('/auth');
    } catch (error: any) {
      console.error('Sign out error:', error);
      toast({
        title: "Error signing out",
        description: error.message || "Please try again or refresh the page.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="mb-8">
      <div className="text-center mb-6">
        <div className="flex flex-col items-center gap-2">
          <Package className="h-12 w-12 text-primary" />
          <h1 className="text-4xl font-bold text-primary">ShopifyCSV.app</h1>
        </div>
        <p className="text-lg text-gray-600">Upload. Format. Sell.</p>
        <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
          ShopifyCSV.app makes it effortless to convert your inventory files into Shopify-ready CSVs. 
          Simply upload your file (CSV or Excel), let our tool format it to meet Shopify's exact requirements, and 
          download your ready-to-use CSV in seconds. No manual edits, no hassle. Just a seamless way 
          to get your products online faster.
        </p>
      </div>

      <div className="flex justify-end">
        {!user ? (
          <Button
            variant="outline"
            onClick={() => navigate('/auth')}
          >
            Sign In to Save File
          </Button>
        ) : (
          <Button
            variant="outline"
            onClick={handleSignOut}
          >
            Sign Out
          </Button>
        )}
      </div>
    </div>
  );
};
