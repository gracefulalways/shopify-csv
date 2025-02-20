
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FieldGroupProps } from "../types";
import { FieldCategoryIcon } from "./FieldCategoryIcon";
import { getFieldCategory } from "@/utils/fieldMappingUtils";

export const FieldGroup = ({ 
  title, 
  description, 
  fields, 
  uploadedHeaders, 
  fieldMapping, 
  onFieldMapping 
}: FieldGroupProps) => (
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
