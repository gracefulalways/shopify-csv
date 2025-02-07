
import { Button } from "@/components/ui/button";
import { SaveIcon } from "lucide-react";

interface ActionButtonsProps {
  user: any | null;
  onDownload: () => void;
  onSaveMapping: () => void;
}

export const ActionButtons = ({ user, onDownload, onSaveMapping }: ActionButtonsProps) => {
  if (!Object.keys(user || {}).length) {
    return (
      <div className="mt-6 flex justify-center">
        <Button onClick={onDownload}>
          Download Processed File
        </Button>
      </div>
    );
  }

  return (
    <div className="mt-6 flex justify-center gap-4">
      <Button onClick={onDownload}>
        Download Processed File
      </Button>
      <Button
        variant="outline"
        onClick={onSaveMapping}
        className="flex items-center gap-2"
      >
        <SaveIcon className="h-4 w-4" />
        Save Mapping
      </Button>
    </div>
  );
};
