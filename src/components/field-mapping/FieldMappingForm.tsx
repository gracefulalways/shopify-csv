
import { Button } from "@/components/ui/button";
import { SaveIcon } from "lucide-react";
import { 
  mandatoryFields, 
  conditionalFields, 
  importantOptionalFields 
} from "@/utils/fieldMappingUtils";
import { FieldMappingFormProps } from "./types";
import { FieldGroup } from "./components/FieldGroup";
import { MappingAlerts } from "./components/MappingAlerts";
import { MappingLegend } from "./components/MappingLegend";

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
      <MappingAlerts 
        isAutoMapped={isAutoMapped}
        uploadedHeaders={uploadedHeaders}
        unmappedMandatoryFields={unmappedMandatoryFields}
        fileName={fileName}
      />

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

          <MappingLegend />

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
