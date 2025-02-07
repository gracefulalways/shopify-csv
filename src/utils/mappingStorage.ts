
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

export const saveMappingConfiguration = async (
  userId: string,
  fileName: string,
  fieldMapping: { [key: string]: string },
  csvContent: string
) => {
  try {
    const { error } = await supabase
      .from('mapping_history')
      .insert({
        user_id: userId,
        original_filename: fileName,
        mapping_config: fieldMapping,
        is_deleted: false,
        csv_content: csvContent
      });

    if (error) {
      if (error.message.includes('upgrade to save more files')) {
        toast({
          title: "File Limit Reached",
          description: "Free users can only save up to 3 files. Please upgrade to save more files.",
          variant: "destructive",
        });
      } else {
        throw error;
      }
      return;
    }

    toast({
      title: "Success",
      description: "Mapping configuration saved successfully!",
    });
  } catch (error: any) {
    toast({
      title: "Error",
      description: "Failed to save mapping configuration: " + error.message,
      variant: "destructive",
    });
  }
};
