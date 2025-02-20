
export const shopifyFields = [
  "Handle",
  "Title",
  "Body (HTML)",
  "Vendor",
  "Product Category",
  "Type",
  "Tags",
  "Published",
  "Option1 Name",
  "Option1 Value",
  "Option2 Name",
  "Option2 Value",
  "Option3 Name",
  "Option3 Value",
  "Variant SKU",
  "Variant Grams",
  "Variant Inventory Tracker",
  "Variant Inventory Qty",
  "Variant Inventory Policy",
  "Variant Fulfillment Service",
  "Variant Price",
  "Variant Compare At Price",
  "Variant Requires Shipping",
  "Variant Taxable",
  "Variant Barcode",
  "Image Src",
  "Image Position",
  "Image Alt Text",
  "Gift Card",
  "SEO Title",
  "SEO Description",
  "Google Shopping / Google Product Category",
  "Google Shopping / Gender",
  "Google Shopping / Age Group",
  "Google Shopping / MPN",
  "Google Shopping / AdWords Grouping",
  "Google Shopping / AdWords Labels",
  "Google Shopping / Condition",
  "Google Shopping / Custom Product",
  "Google Shopping / Custom Label 0",
  "Google Shopping / Custom Label 1",
  "Google Shopping / Custom Label 2",
  "Google Shopping / Custom Label 3",
  "Google Shopping / Custom Label 4",
  "Variant Image",
  "Variant Weight Unit",
  "Variant Tax Code",
  "Cost per item",
  "Price / International",
  "Compare At Price / International",
  "Status"
];

export const mandatoryFields = [
  "Handle",
  "Title",
  "Variant Price",
  "Variant Inventory Qty"
];

export const conditionalFields = [
  "Option1 Name",
  "Option1 Value",
  "Option2 Name",
  "Option2 Value",
  "Option3 Name",
  "Option3 Value",
  "Variant SKU",
  "Variant Inventory Policy",
  "Variant Inventory Tracker"
];

export const importantOptionalFields = [
  "Body (HTML)",
  "Vendor",
  "Type",
  "Tags",
  "Image Src",
  "Published"
];

export const getFieldCategory = (field: string) => {
  if (mandatoryFields.includes(field)) return "mandatory";
  if (conditionalFields.includes(field)) return "conditional";
  if (importantOptionalFields.includes(field)) return "important";
  return "optional";
};

export const autoMapFields = (headers: string[], shopifyFields: string[]) => {
  const newMapping: { [key: string]: string } = {};
  
  shopifyFields.forEach(shopifyField => {
    const shopifyFieldLower = shopifyField.toLowerCase();
    
    let match = headers.find(header => 
      header.toLowerCase() === shopifyFieldLower
    );
    
    if (!match) {
      match = headers.find(header => {
        const headerLower = header.toLowerCase();
        // Clean up field names for comparison by removing common prefixes
        const cleanShopifyField = shopifyFieldLower
          .replace(/variant |option\d+ |google shopping \/ /g, '')
          .replace(/ \/ international/g, '');
        const cleanHeader = headerLower
          .replace(/variant |option\d+ |google shopping \/ /g, '')
          .replace(/ \/ international/g, '');
        return cleanHeader.includes(cleanShopifyField) || cleanShopifyField.includes(cleanHeader);
      });
    }
    
    if (match) {
      newMapping[shopifyField] = match;
    } else {
      newMapping[shopifyField] = "";
    }
  });

  return newMapping;
};
