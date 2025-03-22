
import { VehicleData } from "./types.ts";

/**
 * Service for parsing and handling AI responses
 */
export class ResponseParser {
  /**
   * Parse the text content from OpenAI into structured vehicle data
   */
  parseOpenAIResponse(textContent: string): VehicleData {
    try {
      // First try to parse as JSON
      const data: VehicleData = JSON.parse(textContent);
      console.log('Successfully parsed vehicle data from OpenAI response');
      return data;
    } catch (e) {
      console.error('Error parsing OpenAI response as JSON:', e);
      
      // Try to extract JSON from the response if it's not pure JSON
      const jsonMatch = textContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const data = JSON.parse(jsonMatch[0]);
          console.log('Extracted JSON from partial response');
          return data;
        } catch (error) {
          console.error('Error parsing extracted JSON:', error);
        }
      }
      
      // Additional fallback for non-JSON responses
      console.warn('Could not parse JSON response, attempting to extract structured data');
      
      // Create a fallback object with structured extraction
      const fallbackData: VehicleData = {
        unreliableExtraction: true,
        extractionPartial: true,
      };
      
      // Try to extract key vehicle information using regex patterns
      const yearMatch = textContent.match(/year[:\s]+(\d{4})/i) || textContent.match(/(\d{4})\s+[a-z]+\s+[a-z]+/i);
      if (yearMatch && yearMatch[1]) {
        fallbackData.year = parseInt(yearMatch[1]);
        console.log('Extracted year:', fallbackData.year);
      }
      
      const makeModelMatch = textContent.match(/make[:\s]+([\w\s]+)[\s,]+model[:\s]+([\w\s]+)/i);
      if (makeModelMatch) {
        fallbackData.make = makeModelMatch[1].trim();
        fallbackData.model = makeModelMatch[2].trim();
        console.log('Extracted make and model:', fallbackData.make, fallbackData.model);
      } else {
        // Try different pattern for make/model
        const titleMatch = textContent.match(/(\d{4})\s+([A-Za-z]+)\s+([A-Za-z0-9\s]+)/);
        if (titleMatch) {
          fallbackData.year = parseInt(titleMatch[1]);
          fallbackData.make = titleMatch[2].trim();
          fallbackData.model = titleMatch[3].trim();
          console.log('Extracted year/make/model from title pattern:', fallbackData.year, fallbackData.make, fallbackData.model);
        }
      }
      
      const priceMatch = textContent.match(/price[:\s]*\$?(\d{1,3}(?:,\d{3})*(?:\.\d+)?)/i) || 
                          textContent.match(/\$(\d{1,3}(?:,\d{3})*(?:\.\d+)?)/);
      if (priceMatch && priceMatch[1]) {
        const price = priceMatch[1].replace(/,/g, '');
        fallbackData.price = parseFloat(price);
        console.log('Extracted price:', fallbackData.price);
      }
      
      const mileageMatch = textContent.match(/mileage[:\s]*([0-9,]+)\s*miles/i) || 
                            textContent.match(/([0-9,]+)\s*miles/i);
      if (mileageMatch && mileageMatch[1]) {
        const mileage = mileageMatch[1].replace(/,/g, '');
        fallbackData.mileage = parseInt(mileage);
        console.log('Extracted mileage:', fallbackData.mileage);
      }
      
      const vinMatch = textContent.match(/vin[:\s]*([A-HJ-NPR-Z0-9]{17})/i);
      if (vinMatch && vinMatch[1]) {
        fallbackData.vin = vinMatch[1].toUpperCase();
        console.log('Extracted VIN:', fallbackData.vin);
      }
      
      // If we couldn't extract any important data, return a complete failure
      if (!fallbackData.make && !fallbackData.model && !fallbackData.year && !fallbackData.price) {
        console.error('Could not extract any vehicle data from the response');
        return {
          unreliableExtraction: true,
          extractionFailed: true,
          errorMessage: 'Could not parse vehicle data from the listing'
        };
      }
      
      console.log('Created fallback vehicle data from text extraction');
      return fallbackData;
    }
  }
}
