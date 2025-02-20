
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface HeaderProps {
  user: any;
}

export const Header = ({ user }: HeaderProps) => {
  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <header className="flex justify-between items-center mb-8">
      <Link to="/" className="text-2xl font-bold">
        ShopifyCSV.app
      </Link>
      <nav className="flex items-center gap-4">
        {user ? (
          <>
            <Link to="/dashboard">
              <Button variant="outline">Dashboard</Button>
            </Link>
            <Button variant="outline" onClick={handleSignOut}>
              Sign Out
            </Button>
          </>
        ) : (
          <Link to="/auth">
            <Button variant="outline">Sign In</Button>
          </Link>
        )}
      </nav>
    </header>
  );
};
