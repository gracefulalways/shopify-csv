
import { parseCSVLine } from "./csvUtils";
import { autoMapFields, shopifyFields } from "./fieldMappingUtils";
import { FieldMapping } from "@/types/csv";

export const processFileContent = (text: string) => {
  const lines = text.split(/\r?\n/).filter(line => line.trim());
  const headers = parseCSVLine(lines[0]);
  
  const data = lines.slice(1).map(line => {
    const values = parseCSVLine(line);
    return headers.reduce((obj: any, header, index) => {
      obj[header] = values[index] || '';
      return obj;
    }, {});
  });

  const autoMapped = autoMapFields(headers, shopifyFields);

  return {
    headers,
    data,
    autoMapped,
  };
};

export const generateProcessedCSV = (csvData: any[], fieldMapping: FieldMapping) => {
  const processedData = csvData.map(row => {
    const processedRow: { [key: string]: string } = {};
    shopifyFields.forEach(shopifyField => {
      const mappedField = fieldMapping[shopifyField];
      const value = mappedField && mappedField !== "" ? (row[mappedField] || '') : '';
      processedRow[shopifyField] = value;
    });
    return processedRow;
  });

  const csv = [
    shopifyFields.join(','),
    ...processedData.map(row => shopifyFields.map(field => row[field]).join(','))
  ].join('\n');

  return csv;
};
