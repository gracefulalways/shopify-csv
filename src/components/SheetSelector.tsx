
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { List, FileSpreadsheet } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SheetInfo {
  name: string;
  rowCount: number;
}

interface SheetSelectorProps {
  sheets: SheetInfo[];
  onSheetSelect: (sheetName: string) => void;
  isOpen: boolean;
}

export const SheetSelector = ({ sheets, onSheetSelect, isOpen }: SheetSelectorProps) => {
  return (
    <Sheet open={isOpen} modal>
      <SheetContent side="right" className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Select Sheet to Import
          </SheetTitle>
          <SheetDescription>
            This Excel file contains multiple sheets. Please select the sheet you want to import.
          </SheetDescription>
        </SheetHeader>
        
        <ScrollArea className="h-[70vh] mt-6">
          <div className="space-y-2">
            {sheets.map((sheet) => (
              <Button
                key={sheet.name}
                variant="outline"
                className="w-full justify-start text-left h-auto p-4"
                onClick={() => onSheetSelect(sheet.name)}
              >
                <div>
                  <div className="font-medium">{sheet.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {sheet.rowCount.toLocaleString()} rows
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};
