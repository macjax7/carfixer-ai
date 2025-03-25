
// Clean text by removing component diagram markers
export const cleanText = (content: string): string => {
  return content.replace(/{COMPONENT_DIAGRAM:\s*({.*?})}/s, '');
};

// Check if message contains a structured repair guide
export const containsStructuredRepairGuide = (
  content: string, 
  format?: string
): boolean => {
  return format === 'structured' || 
         content.includes('## Tools') || 
         content.includes('# Tools') ||
         content.includes('## Step') || 
         content.includes('# Step');
};
