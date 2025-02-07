
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface HeaderProps {
  user: any;
}

export const Header = ({ user }: HeaderProps) => {
  return (
    <div className="flex justify-between items-center mb-8">
      <h1 className="text-3xl font-bold">CSV Processor for Shopify</h1>
      {!user ? (
        <Button
          variant="outline"
          onClick={() => window.location.href = '/auth'}
        >
          Sign in to Save Mappings
        </Button>
      ) : (
        <Button
          variant="outline"
          onClick={() => supabase.auth.signOut()}
        >
          Sign Out
        </Button>
      )}
    </div>
  );
};
