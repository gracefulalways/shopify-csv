
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

interface ProcessingConfig {
  id?: string;
  brandName: string;
  weightAdjustment: number;
  includeNationwideShipping: boolean;
}

export const useProcessingConfig = () => {
  const [config, setConfig] = useState<ProcessingConfig>({
    brandName: '',
    weightAdjustment: 2.0,
    includeNationwideShipping: true
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      const { data, error } = await supabase
        .from('processing_configs')
        .select('*')
        .eq('user_id', user.user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setConfig({
          id: data.id,
          brandName: data.brand_name || '',
          weightAdjustment: data.weight_adjustment,
          includeNationwideShipping: data.include_nationwide_shipping
        });
      }
    } catch (error) {
      console.error('Error loading config:', error);
      toast({
        title: "Error",
        description: "Failed to load processing configuration.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveConfig = async (newConfig: Partial<ProcessingConfig>) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        toast({
          title: "Error",
          description: "You must be logged in to save configurations.",
          variant: "destructive",
        });
        return;
      }

      const updatedConfig = { ...config, ...newConfig };
      setConfig(updatedConfig);

      const { error } = await supabase
        .from('processing_configs')
        .upsert({
          user_id: user.user.id,
          brand_name: updatedConfig.brandName,
          weight_adjustment: updatedConfig.weightAdjustment,
          include_nationwide_shipping: updatedConfig.includeNationwideShipping
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Processing configuration saved successfully.",
      });
    } catch (error) {
      console.error('Error saving config:', error);
      toast({
        title: "Error",
        description: "Failed to save processing configuration.",
        variant: "destructive",
      });
    }
  };

  return {
    config,
    isLoading,
    saveConfig
  };
};
