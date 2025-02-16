
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

export const handleFileUpload = async (file: File) => {
  const user = (await supabase.auth.getUser()).data.user;
  if (user) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('userId', user.id);

    const response = await supabase.functions.invoke('upload-csv', {
      body: formData,
    });

    if (response.error) {
      toast({
        title: "Error",
        description: "Failed to upload file. Your mapping will still work but won't be saved for later use.",
        variant: "destructive",
      });
    }
  }
};

export const FILE_SIZE_WARNING_THRESHOLD = 5 * 1024 * 1024; // 5MB in bytes

export const checkFileSize = (file: File) => {
  if (file.size > FILE_SIZE_WARNING_THRESHOLD) {
    const fileSizeMB = (file.size / (1024 * 1024)).toFixed(1);
    toast({
      title: "Large File Detected",
      description: `This file is ${fileSizeMB}MB. Processing may take longer than usual. Please be patient while we handle your file.`,
      duration: 6000,
    });
  }
};
