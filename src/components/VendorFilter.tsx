
import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, CheckSquare, Square } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface VendorFilterProps {
  vendors: string[];
  selectedVendors: string[];
  onVendorSelection: (vendors: string[]) => void;
  productCountByVendor: { [key: string]: number };
  uploadedHeaders: string[];
  vendorFilterField: string;
  onVendorFilterMapping: (field: string) => void;
}

export const VendorFilter = ({
  vendors,
  selectedVendors,
  onVendorSelection,
  productCountByVendor,
  uploadedHeaders,
  vendorFilterField,
  onVendorFilterMapping,
}: VendorFilterProps) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredVendors = vendors.filter((vendor) =>
    vendor.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectAll = () => {
    onVendorSelection(vendors);
  };

  const handleSelectNone = () => {
    onVendorSelection([]);
  };

  const toggleVendor = (vendor: string) => {
    const newSelection = selectedVendors.includes(vendor)
      ? selectedVendors.filter((v) => v !== vendor)
      : [...selectedVendors, vendor];
    onVendorSelection(newSelection);
  };

  const totalSelectedProducts = selectedVendors.reduce(
    (sum, vendor) => sum + (productCountByVendor[vendor] || 0),
    0
  );

  const handleVendorFieldChange = (value: string) => {
    // Convert "none" back to empty string for the parent component
    onVendorFilterMapping(value === "none" ? "" : value);
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Filter by Vendor</h3>
          <Select
            value={vendorFilterField || "none"}
            onValueChange={handleVendorFieldChange}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select vendor field..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None (no filtering)</SelectItem>
              {uploadedHeaders.map((header) => (
                <SelectItem key={header} value={header}>
                  {header}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {vendorFilterField && (
          <>
            <div className="flex items-center space-x-2">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search vendors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Button variant="outline" onClick={handleSelectAll} className="whitespace-nowrap">
                <CheckSquare className="mr-2 h-4 w-4" />
                Select All
              </Button>
              <Button variant="outline" onClick={handleSelectNone} className="whitespace-nowrap">
                <Square className="mr-2 h-4 w-4" />
                Select None
              </Button>
            </div>

            <div className="text-sm text-muted-foreground">
              {selectedVendors.length} vendor{selectedVendors.length !== 1 ? 's' : ''} selected
              ({totalSelectedProducts} product{totalSelectedProducts !== 1 ? 's' : ''} will be exported)
            </div>

            <ScrollArea className="h-[300px] pr-4">
              <div className="space-y-2">
                {filteredVendors.map((vendor) => (
                  <div
                    key={vendor}
                    className="flex items-center space-x-2 rounded-lg p-2 hover:bg-muted"
                  >
                    <Checkbox
                      id={`vendor-${vendor}`}
                      checked={selectedVendors.includes(vendor)}
                      onCheckedChange={() => toggleVendor(vendor)}
                    />
                    <label
                      htmlFor={`vendor-${vendor}`}
                      className="flex-1 cursor-pointer text-sm"
                    >
                      {vendor}
                      <span className="ml-2 text-muted-foreground">
                        ({productCountByVendor[vendor] || 0})
                      </span>
                    </label>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </>
        )}
      </div>
    </Card>
  );
};
