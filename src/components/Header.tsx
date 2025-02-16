
import { Button } from "@/components/ui/button";
import { Package } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface HeaderProps {
  user: any;
}

export const Header = ({ user }: HeaderProps) => {
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
      
      {/* Google AdSense Script */}
      <script 
        async 
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-YOUR_PUBLISHER_ID"
        crossOrigin="anonymous"
      ></script>
      {/* AdSense Ad Unit */}
      <ins 
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-YOUR_PUBLISHER_ID"
        data-ad-slot="YOUR_AD_SLOT_ID"
        data-ad-format="auto"
        data-full-width-responsive="true"
      ></ins>
      <script>
        (adsbygoogle = window.adsbygoogle || []).push({});
      </script>

      <div className="flex justify-end">
        {!user ? (
          <Button
            variant="outline"
            onClick={() => window.location.href = '/auth'}
          >
            Sign In to Save File
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
    </div>
  );
};
