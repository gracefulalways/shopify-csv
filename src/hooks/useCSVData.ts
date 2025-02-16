
import { useState } from 'react';
import { parseCSVLine } from '@/utils/csvUtils';
import { FieldMapping } from '@/types/csv';
import { autoMapFields } from '@/utils/fieldMappingUtils';
import { shopifyFields } from '@/utils/fieldMappingUtils';
import { toast } from "@/components/ui/use-toast";

export const useCSVData = () => {
  const [fileName, setFileName] = useState<string>("");
  const [uploadedHeaders, setUploadedHeaders] = useState<string[]>([]);
  const [fieldMapping, setFieldMapping] = useState<FieldMapping>({});
  const [csvData, setCsvData] = useState<any[]>([]);
  const [isAutoMapped, setIsAutoMapped] = useState(false);
  const [rawCSV, setRawCSV] = useState<string>("");
  const [selectedVendors, setSelectedVendors] = useState<string[]>([]);
  const [vendorFilterField, setVendorFilterField] = useState<string>("");

  const handleFieldMapping = (shopifyField: string, uploadedField: string) => {
    setFieldMapping(prev => ({
      ...prev,
      [shopifyField]: uploadedField
    }));
  };

  const handleVendorFilterMapping = (field: string) => {
    setVendorFilterField(field);
    setSelectedVendors([]); // Reset selected vendors when mapping changes
  };

  const processCSVContent = (text: string) => {
    const lines = text.split(/\r?\n/).filter(line => line.trim());
    const headers = parseCSVLine(lines[0]);
    setUploadedHeaders(headers);
    
    const data = lines.slice(1).map(line => {
      const values = parseCSVLine(line);
      return headers.reduce((obj: any, header, index) => {
        obj[header] = values[index] || '';
        return obj;
      }, {});
    });
    setCsvData(data);

    const autoMapped = autoMapFields(headers, shopifyFields);
    setFieldMapping(autoMapped);
    setIsAutoMapped(true);

    // Try to auto-map vendor filter field
    const vendorKeywords = ['vendor', 'supplier', 'manufacturer', 'brand'];
    const possibleVendorField = headers.find(header => 
      vendorKeywords.some(keyword => header.toLowerCase().includes(keyword))
    );
    if (possibleVendorField) {
      setVendorFilterField(possibleVendorField);
    }
  };

  const getUniqueVendors = (): string[] => {
    if (!vendorFilterField) return [];
    const vendors = new Set(csvData.map(row => row[vendorFilterField]));
    return Array.from(vendors).filter(Boolean).sort();
  };

  const getProductCountByVendor = (): { [key: string]: number } => {
    if (!vendorFilterField) return {};
    return csvData.reduce((acc: { [key: string]: number }, row) => {
      const vendor = row[vendorFilterField];
      if (vendor) {
        acc[vendor] = (acc[vendor] || 0) + 1;
      }
      return acc;
    }, {});
  };

  return {
    fileName,
    setFileName,
    uploadedHeaders,
    setUploadedHeaders,
    fieldMapping,
    setFieldMapping,
    csvData,
    setCsvData,
    isAutoMapped,
    setIsAutoMapped,
    rawCSV,
    setRawCSV,
    selectedVendors,
    setSelectedVendors,
    vendorFilterField,
    handleFieldMapping,
    handleVendorFilterMapping,
    processCSVContent,
    getUniqueVendors,
    getProductCountByVendor
  };
};
