
import { ReactNode } from "react";

export interface FieldMappingFormProps {
  isAutoMapped: boolean;
  uploadedHeaders: string[];
  shopifyFields: string[];
  fieldMapping: Record<string, string>;
  onFieldMapping: (shopifyField: string, uploadedField: string) => void;
  onSaveMapping: () => void;
  user: any;
  fileName: string;
}

export interface FieldGroupProps {
  title: string;
  description: string;
  fields: string[];
  uploadedHeaders: string[];
  fieldMapping: Record<string, string>;
  onFieldMapping: (shopifyField: string, uploadedField: string) => void;
}

export interface MappingAlertsProps {
  isAutoMapped: boolean;
  uploadedHeaders: string[];
  unmappedMandatoryFields: string[];
  fileName: string;
}

export interface FieldCategoryIconProps {
  field: string;
}
