
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
  "Variant SKU",
  "Variant Price",
  "Variant Compare At Price",
  "Variant Inventory Tracker",
  "Variant Inventory Quantity",
  "Variant Weight",
  "Variant Weight Unit",
  "Image Src",
  "Status"
];

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
        const cleanShopifyField = shopifyFieldLower.replace(/variant |option\d+ /g, '');
        const cleanHeader = headerLower.replace(/variant |option\d+ /g, '');
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
