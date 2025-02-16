
import { parseCSVLine } from "./csvUtils";
import { autoMapFields, shopifyFields } from "./fieldMappingUtils";
import { FieldMapping } from "@/types/csv";

export const processFileContent = (text: string) => {
  const lines = text.split(/\r?\n/).filter(line => line.trim());
  if (lines.length === 0) {
    throw new Error('File is empty');
  }

  const headers = parseCSVLine(lines[0]);
  const data = [];
  const totalLines = lines.length;
  
  // Process in chunks of 1000 rows
  const CHUNK_SIZE = 1000;
  for (let i = 1; i < lines.length; i += CHUNK_SIZE) {
    const chunk = lines.slice(i, Math.min(i + CHUNK_SIZE, lines.length));
    const chunkData = chunk.map(line => {
      const values = parseCSVLine(line);
      return headers.reduce((obj: any, header, index) => {
        obj[header] = values[index] || '';
        return obj;
      }, {});
    });
    
    data.push(...chunkData);
    
    // Report progress
    const progress = Math.min(100, Math.round((i / totalLines) * 100));
    window.dispatchEvent(new CustomEvent('csv-processing-progress', {
      detail: { progress, processedRows: i, totalRows: totalLines }
    }));
  }

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
    ...processedData.map(row => 
      shopifyFields.map(field => {
        const value = row[field] || '';
        return value.includes(',') || value.includes('"') || value.includes('\n')
          ? `"${value.replace(/"/g, '""')}"`
          : value;
      }).join(',')
    )
  ].join('\n');

  return csv;
};
