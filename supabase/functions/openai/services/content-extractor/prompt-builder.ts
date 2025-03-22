
/**
 * Service for generating AI prompts for vehicle data extraction
 */
export class PromptBuilder {
  /**
   * Build a prompt for vehicle data extraction
   */
  buildVehicleDataPrompt(text: string, platformHint: string): string {
    // Limit text to avoid exceeding token limits
    const truncatedText = text.slice(0, 8000);
    
    return `
Extract vehicle information from this listing:

${truncatedText}

${platformHint}

Extract and format as JSON with these fields:
- make (string): Car manufacturer (e.g., Ford, Toyota, Honda)
- model (string): Car model (e.g., F-150, Camry, Civic)
- year (number): Production year (e.g., 2018)
- price (number): Asking price in USD without currency symbols or commas
- mileage (number): Mileage in miles without commas
- vin (string, optional): Vehicle Identification Number if available (17-character alphanumeric code)
- description (string): Seller's description, trimmed if needed
- imageUrl (string, optional): URL to main image if found in the data

Focus on accuracy. For the price and mileage, return only the numeric value without currency symbols or commas.
Return ONLY the JSON with these fields, nothing else. If a field is not found in the text, omit it from the JSON.
`;
  }
}
