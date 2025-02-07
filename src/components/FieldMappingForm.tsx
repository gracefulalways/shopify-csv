
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { InfoIcon, SaveIcon } from "lucide-react";

interface FieldMappingFormProps {
  isAutoMapped: boolean;
  uploadedHeaders: string[];
  shopifyFields: string[];
  fieldMapping: Record<string, string>;
  onFieldMapping: (shopifyField: string, uploadedField: string) => void;
  onSaveMapping: () => void;
  user: any;
}

export const FieldMappingForm = ({
  isAutoMapped,
  uploadedHeaders,
  shopifyFields,
  fieldMapping,
  onFieldMapping,
  onSaveMapping,
  user
}: FieldMappingFormProps) => {
  return (
    <div className="mb-6">
      {isAutoMapped && uploadedHeaders.length > 0 && (
        <Alert className="mb-6">
          <InfoIcon className="h-4 w-4" />
          <AlertDescription>
            Fields have been automatically mapped. Please review the mappings below and adjust if needed before downloading the processed file.
          </AlertDescription>
        </Alert>
      )}

      {uploadedHeaders.length > 0 && (
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Review Field Mappings</h2>
            {user && (
              <Button
                variant="outline"
                onClick={onSaveMapping}
                className="flex items-center gap-2"
              >
                <SaveIcon className="h-4 w-4" />
                Save Mapping
              </Button>
            )}
          </div>
          <div className="grid gap-4">
            {shopifyFields.map((shopifyField) => (
              <div key={shopifyField} className="flex items-center gap-4">
                <span className="w-1/3 text-sm font-medium">{shopifyField}</span>
                <Select
                  value={fieldMapping[shopifyField] || ""}
                  onValueChange={(value) => onFieldMapping(shopifyField, value)}
                >
                  <SelectTrigger className="w-2/3">
                    <SelectValue placeholder="Select field..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None (leave empty)</SelectItem>
                    {uploadedHeaders.map((header) => (
                      <SelectItem key={header} value={header}>
                        {header}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
