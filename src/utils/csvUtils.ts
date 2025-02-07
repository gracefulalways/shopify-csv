
export const parseCSVLine = (line: string): string[] => {
  const result: string[] = [];
  let field = '';
  let insideQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      if (insideQuotes) {
        if (i + 1 < line.length && line[i + 1] === '"') {
          // Handle escaped quotes
          field += '"';
          i++; // Skip next quote
        } else {
          // End of quoted section
          insideQuotes = false;
        }
      } else {
        // Start of quoted section
        insideQuotes = true;
      }
    } else if (char === ',' && !insideQuotes) {
      // End of field - only if not inside quotes
      result.push(field.trim());
      field = '';
    } else {
      field += char;
    }
  }
  
  // Push the last field
  result.push(field.trim());
  
  // Clean up any remaining quotes at the start/end of fields
  return result.map(field => {
    if (field.startsWith('"') && field.endsWith('"')) {
      return field.slice(1, -1).replace(/""/g, '"');
    }
    return field;
  });
};

export const escapeCSVValue = (value: string): string => {
  if (!value) return '';
  
  // If the value contains quotes, commas, or newlines, it needs to be escaped
  if (value.includes('"') || value.includes(',') || value.includes('\n')) {
    // Replace any quotes with double quotes and wrap the entire value in quotes
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
};
