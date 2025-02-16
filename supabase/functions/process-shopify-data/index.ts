
import { serve } from "https://deno.fresh.dev/std@v1/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

interface ProcessingConfig {
  weightAdjustment: number;
  includeNationwideShipping: boolean;
  brandName?: string;
}

const generateSlug = (itemNo: string, supplierModel: string): string => {
  const combined = `${itemNo}-${supplierModel}`;
  const slug = combined.toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-');
  return slug;
};

const calculateGrams = (weightInLbs: number, adjustment: number = 2): number => {
  const adjustedWeight = weightInLbs + adjustment;
  const roundedWeight = Math.ceil(adjustedWeight);
  const weightInGrams = roundedWeight * 453.592;
  return Math.round(weightInGrams);
};

const generateSeoDescription = (descLong: string, includeNationwide: boolean): string => {
  if (!descLong) return "Nationwide Shipping";
  return includeNationwide ? `${descLong} Nationwide Shipping` : descLong;
};

const generateBodyHtml = (row: any): string => {
  const descLong = row['Item Desc Long'] || "";
  const bullets = row['Bullets'] || "";
  const length = row['Length'] || "N/A";
  const width = row['Width'] || "N/A";
  const height = row['Height'] || "N/A";
  const dimensions = `Dimensions: ${length} x ${width} x ${height}`;
  const barcode = row['Barcode'] || "N/A";
  const code = `Code: ${barcode}`;
  return `<p>${descLong}</p><p>${bullets}</p><p>${dimensions}</p><p>${code}</p>`;
};

const splitImagesIntoRows = (row: any): any[] => {
  const baseRow = { ...row };
  if (!row.Images) {
    baseRow['Image Src'] = "";
    baseRow['Image Position'] = 1;
    return [baseRow];
  }

  const imageUrls = row.Images.split(",").map((url: string) => url.trim());
  return imageUrls.map((imageUrl: string, index: number) => ({
    ...baseRow,
    'Image Src': imageUrl,
    'Image Position': index + 1
  }));
};

const processData = (data: any[], config: ProcessingConfig) => {
  let processedData = data.map(row => ({
    ...row,
    Handle: generateSlug(row['Short Item No'], row['Supplier Model']),
    'Variant Grams': calculateGrams(row['Weight'], config.weightAdjustment),
    'SEO Description': generateSeoDescription(row['Item Desc Long'], config.includeNationwideShipping),
    'Body (HTML)': generateBodyHtml(row),
    Published: row['Availability'] === "YES" ? "TRUE" : "FALSE",
    Status: 'draft',
    'Variant Price': typeof row['Map Price'] === 'number' ? row['Map Price'] : row['List Price'],
    'Cost per item': row['Product Price'],
    'Variant SKU': row['Barcode'],
    'Variant Barcode': row['Barcode'],
    'Google Shopping / Condition': row['Condition'],
    'Google Shopping / MPN': row['Barcode'],
    Title: row['Supplier Item Desc'],
    'Image Alt Text': row['Supplier Item Desc'],
    'SEO Title': row['Supplier Item Desc']
  }));

  // Filter by brand if specified
  if (config.brandName) {
    processedData = processedData.filter(row => row['Brand Name'] === config.brandName);
  }

  // Handle images
  let finalData: any[] = [];
  processedData.forEach(row => {
    const rowsWithImages = splitImagesIntoRows(row);
    finalData.push(...rowsWithImages);
  });

  return finalData;
};

serve(async (req) => {
  try {
    const { data, config } = await req.json();
    
    if (!data || !Array.isArray(data)) {
      return new Response(
        JSON.stringify({ error: "Invalid data format" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const processedData = processData(data, config);

    return new Response(
      JSON.stringify({ data: processedData }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
