
import { Button } from "@/components/ui/button";
import { Settings, ArrowLeft } from "lucide-react";

interface SettingsHeaderProps {
  onBackClick: () => void;
}

export const SettingsHeader = ({ onBackClick }: SettingsHeaderProps) => {
  return (
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-2">
        <Settings className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Settings</h1>
      </div>
      <Button
        variant="outline"
        onClick={onBackClick}
        className="flex items-center gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Home
      </Button>
    </div>
  );
};
