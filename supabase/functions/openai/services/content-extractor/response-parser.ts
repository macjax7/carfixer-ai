
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
          throw new Error('Could not extract JSON from OpenAI response');
        }
      } else {
        throw new Error('Could not extract JSON from OpenAI response');
      }
    }
  }
}
