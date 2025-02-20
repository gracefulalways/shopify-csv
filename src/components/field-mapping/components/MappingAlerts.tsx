
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";
import { MappingAlertsProps } from "../types";

export const MappingAlerts = ({ 
  isAutoMapped, 
  uploadedHeaders,
  unmappedMandatoryFields,
  fileName 
}: MappingAlertsProps) => {
  return (
    <>
      {isAutoMapped && uploadedHeaders.length > 0 && (
        <Alert className="mb-6">
          <InfoIcon className="h-4 w-4" />
          <AlertDescription>
            All done. Your file - '{fileName}' - has been successfully upload and fields have been automatically mapped. Please review the mappings below and adjust if needed before downloading the processed file.
          </AlertDescription>
        </Alert>
      )}

      {uploadedHeaders.length > 0 && unmappedMandatoryFields.length > 0 && (
        <Alert className="mb-6" variant="destructive">
          <AlertDescription>
            {unmappedMandatoryFields.length} required fields are not mapped: {unmappedMandatoryFields.join(", ")}
          </AlertDescription>
        </Alert>
      )}
    </>
  );
};
