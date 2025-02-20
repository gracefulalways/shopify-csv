
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { InfoIcon, SaveIcon, StarIcon, CircleDotIcon } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { 
  shopifyFields, 
  mandatoryFields, 
  conditionalFields, 
  importantOptionalFields,
  getFieldCategory 
} from "@/utils/fieldMappingUtils";

interface FieldMappingFormProps {
  isAutoMapped: boolean;
  uploadedHeaders: string[];
  shopifyFields: string[];
  fieldMapping: Record<string, string>;
  onFieldMapping: (shopifyField: string, uploadedField: string) => void;
  onSaveMapping: () => void;
  user: any;
  fileName: string;
}

const FieldCategoryIcon = ({ field }: { field: string }) => {
  const category = getFieldCategory(field);
  
  if (category === "mandatory") {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <StarIcon className="h-4 w-4 text-red-500 inline mr-2" />
          </TooltipTrigger>
          <TooltipContent>
            <p>Required for successful import</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
  
  if (category === "conditional") {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <CircleDotIcon className="h-4 w-4 text-orange-500 inline mr-2" />
          </TooltipTrigger>
          <TooltipContent>
            <p>Required if using variants or specific features</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
  
  if (category === "important") {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <InfoIcon className="h-4 w-4 text-blue-500 inline mr-2" />
          </TooltipTrigger>
          <TooltipContent>
            <p>Recommended for better product listings</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
  
  return null;
};

const FieldGroup = ({ 
  title, 
  description, 
  fields, 
  uploadedHeaders, 
  fieldMapping, 
  onFieldMapping 
}: { 
  title: string;
  description: string;
  fields: string[];
  uploadedHeaders: string[];
  fieldMapping: Record<string, string>;
  onFieldMapping: (shopifyField: string, uploadedField: string) => void;
}) => (
  <div className="mb-6">
    <h3 className="text-lg font-semibold mb-2">{title}</h3>
    <p className="text-sm text-gray-600 mb-4">{description}</p>
    <div className="grid gap-4">
      {fields.map((field) => (
        <div key={field} className="flex items-center gap-4">
          <FieldCategoryIcon field={field} />
          <span className="w-1/3 text-sm font-medium">{field}</span>
          <Select
            value={fieldMapping[field] || "__NONE__"}
            onValueChange={(value) => onFieldMapping(field, value === "__NONE__" ? "" : value)}
          >
            <SelectTrigger className={`w-2/3 ${
              getFieldCategory(field) === "mandatory" && !fieldMapping[field] 
                ? "border-red-500" 
                : ""
            }`}>
              <SelectValue placeholder="Select field..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__NONE__">None (leave empty)</SelectItem>
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
);

export const FieldMappingForm = ({
  isAutoMapped,
  uploadedHeaders,
  shopifyFields,
  fieldMapping,
  onFieldMapping,
  onSaveMapping,
  user,
  fileName
}: FieldMappingFormProps) => {
  const unmappedMandatoryFields = mandatoryFields.filter(
    field => !fieldMapping[field]
  );

  return (
    <div className="mb-6">
      {isAutoMapped && uploadedHeaders.length > 0 && (
        <Alert className="mb-6">
          <InfoIcon className="h-4 w-4" />
          <AlertDescription>
            All done. Your file - '{fileName}' - has been successfully upload and fields have been automatically mapped. Please review the mappings below and adjust if needed before downloading the processed file.
          </AlertDescription>
        </Alert>
      )}

      {unmappedMandatoryFields.length > 0 && (
        <Alert className="mb-6" variant="destructive">
          <AlertDescription>
            {unmappedMandatoryFields.length} required fields are not mapped: {unmappedMandatoryFields.join(", ")}
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

          <div className="flex gap-2 mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 mr-4">
              <StarIcon className="h-4 w-4 text-red-500" />
              <span className="text-sm">Required</span>
            </div>
            <div className="flex items-center gap-2 mr-4">
              <CircleDotIcon className="h-4 w-4 text-orange-500" />
              <span className="text-sm">Conditional</span>
            </div>
            <div className="flex items-center gap-2">
              <InfoIcon className="h-4 w-4 text-blue-500" />
              <span className="text-sm">Recommended</span>
            </div>
          </div>

          <FieldGroup
            title="Required Fields"
            description="These fields must be mapped for a successful import"
            fields={mandatoryFields}
            uploadedHeaders={uploadedHeaders}
            fieldMapping={fieldMapping}
            onFieldMapping={onFieldMapping}
          />

          <FieldGroup
            title="Conditionally Required Fields"
            description="These fields are required if you're using variants or specific features"
            fields={conditionalFields}
            uploadedHeaders={uploadedHeaders}
            fieldMapping={fieldMapping}
            onFieldMapping={onFieldMapping}
          />

          <FieldGroup
            title="Recommended Fields"
            description="These fields enhance your product listings and improve searchability"
            fields={importantOptionalFields}
            uploadedHeaders={uploadedHeaders}
            fieldMapping={fieldMapping}
            onFieldMapping={onFieldMapping}
          />

          <FieldGroup
            title="Additional Fields"
            description="Optional fields for additional product information"
            fields={shopifyFields.filter(field => 
              !mandatoryFields.includes(field) && 
              !conditionalFields.includes(field) && 
              !importantOptionalFields.includes(field)
            )}
            uploadedHeaders={uploadedHeaders}
            fieldMapping={fieldMapping}
            onFieldMapping={onFieldMapping}
          />
        </div>
      )}
    </div>
  );
};
