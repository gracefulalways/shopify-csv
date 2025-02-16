
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface SheetSelectorProps {
  sheets: string[];
  isOpen: boolean;
  onClose: () => void;
  onSheetSelect: (sheetName: string) => void;
}

export const SheetSelector = ({ sheets, isOpen, onClose, onSheetSelect }: SheetSelectorProps) => {
  const [selectedSheet, setSelectedSheet] = useState<string>(sheets[0] || "");

  const handleConfirm = () => {
    onSheetSelect(selectedSheet);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Select Sheet to Import</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <RadioGroup
            value={selectedSheet}
            onValueChange={setSelectedSheet}
            className="space-y-3"
          >
            {sheets.map((sheet) => (
              <div key={sheet} className="flex items-center space-x-2">
                <RadioGroupItem value={sheet} id={sheet} />
                <Label htmlFor={sheet}>{sheet}</Label>
              </div>
            ))}
          </RadioGroup>
        </div>
        <div className="flex justify-end">
          <Button onClick={handleConfirm}>Import Selected Sheet</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
