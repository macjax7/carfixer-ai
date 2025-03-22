
const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

/**
 * Service for analyzing vehicle data
 */
export class VehicleAnalyzerService {
  /**
   * Analyze vehicle listing data to provide insights
   */
  async analyzeVehicleListing(vehicleData: any) {
    try {
      // Validate the input data to ensure we have basic required information
      const validationErrors = this.validateVehicleData(vehicleData);
      
      // If missing critical data, mark extraction as unreliable
      if (validationErrors.length > 0) {
        console.warn('Vehicle data validation failed:', validationErrors);
        console.warn('Incomplete vehicle data for analysis:', vehicleData);
        
        // If missing critical fields (year+make+model or VIN), return error
        if (!((vehicleData.year && vehicleData.make && vehicleData.model) || vehicleData.vin)) {
          console.error('Missing critical vehicle identification data');
          return {
            unreliableExtraction: true,
            validationErrors,
            errorMessage: "Could not reliably identify the vehicle from the provided link"
          };
        }
      }

      // Build a comprehensive prompt with all available vehicle data
      const promptText = `
Analyze this specific vehicle listing in detail:
${vehicleData.year ? `- Year: ${vehicleData.year}` : '- Year: Unknown'}
${vehicleData.make ? `- Make: ${vehicleData.make}` : '- Make: Unknown'}
${vehicleData.model ? `- Model: ${vehicleData.model}` : '- Model: Unknown'}
${vehicleData.price ? `- Price: $${vehicleData.price}` : '- Price: Not specified'}
${vehicleData.mileage ? `- Mileage: ${vehicleData.mileage} miles` : '- Mileage: Not specified'}
${vehicleData.vin ? `- VIN: ${vehicleData.vin}` : '- VIN: Not provided'}
${vehicleData.description ? `- Description: "${vehicleData.description}"` : '- Description: Not provided'}

CRITICAL INSTRUCTIONS:
- Base your analysis ONLY on the details provided above for this specific listing.
- DO NOT substitute information about different vehicles.
- DO NOT make up information that is not provided.
- If certain information is missing, clearly state that it's limited by the data available.
- If you cannot provide a meaningful analysis due to insufficient data, state this limitation in your response.
- Avoid generic statements that could apply to any vehicle - be specific to this exact listing.

Based on the available information, provide a thorough analysis covering:

1. Reliability: Evaluate the specific model year's reliability rating, common issues, and overall durability. If the year is unknown, discuss the model's general reliability across recent years. If not enough vehicle data is provided, state that reliability assessment requires specific vehicle information.

2. Market Value: Assess whether the price is fair based on current market conditions, comparable listings, and factors like mileage and condition. If pricing data is missing, explain that a value assessment cannot be made without pricing information.

3. Maintenance Needs: Detail what maintenance would likely be needed at this mileage (or based on the vehicle's age if mileage is unknown). Include both routine maintenance and model-specific concerns.

4. Red Flags: Identify any concerning issues in the listing, such as pricing inconsistencies, potential hidden problems, or common issues with this specific make/model/year.

5. Recommendation: Provide a clear recommendation on whether someone should purchase this vehicle, with specific reasoning based on all the above factors.

Format your response as a JSON object with these 5 keys. Each value should be a detailed paragraph providing substantive analysis. If certain information is missing from the listing, acknowledge those limitations rather than making assumptions.
`;

      console.log('Sending vehicle analysis prompt to OpenAI');
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            { 
              role: 'system', 
              content: 'You are an expert automotive analyst specializing in used car evaluations. You MUST only provide analysis based on explicitly provided vehicle details. Never invent or substitute information not present in the listing. If critical information is missing, acknowledge these limitations and explain how they impact your analysis. Your priority is accuracy, not comprehensiveness when data is insufficient.' 
            },
            { role: 'user', content: promptText }
          ],
          temperature: 0.2, // Lower temperature for more factual, less creative responses
          response_format: { type: "json_object" } // Request JSON format explicitly
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('OpenAI API error:', errorData);
        throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
      }

      const result = await response.json();
      const textContent = result.choices[0].message.content;
      
      // Parse the JSON response
      let analysisData;
      try {
        analysisData = JSON.parse(textContent);
        console.log('Successfully parsed analysis data');
        
        // Ensure all required fields are present
        const requiredFields = ['reliability', 'marketValue', 'maintenanceNeeds', 'redFlags', 'recommendation'];
        const missingFields = requiredFields.filter(field => !analysisData[field]);
        
        if (missingFields.length > 0) {
          console.warn(`Analysis missing fields: ${missingFields.join(', ')}`);
          
          // Add placeholder content for any missing fields that clearly indicates limitations
          missingFields.forEach(field => {
            analysisData[field] = this.getLimitationsContentForField(field, vehicleData);
          });
        }
        
      } catch (e) {
        console.error('Error parsing OpenAI response as JSON:', e);
        // Try to extract JSON from the response if it's not pure JSON
        const jsonMatch = textContent.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          analysisData = JSON.parse(jsonMatch[0]);
          console.log('Extracted JSON from partial response');
        } else {
          throw new Error('Could not extract JSON from OpenAI response');
        }
      }
      
      console.log('Analysis data generated successfully');
      
      // Add validation flags to the response
      return {
        ...analysisData,
        dataValidation: {
          hasErrors: validationErrors.length > 0,
          errors: validationErrors,
          isReliable: validationErrors.length === 0 || 
                     ((vehicleData.year && vehicleData.make && vehicleData.model) || vehicleData.vin)
        }
      };
    } catch (error) {
      console.error('Error analyzing vehicle listing:', error);
      // Provide error analysis that clearly indicates the issue
      return this.generateErrorAnalysis(vehicleData, error);
    }
  }
  
  /**
   * Validate vehicle data for minimum required fields
   */
  private validateVehicleData(vehicleData: any): string[] {
    const errors = [];
    
    // Check for minimum required fields
    if (!vehicleData.make) errors.push('Missing vehicle make');
    if (!vehicleData.model) errors.push('Missing vehicle model');
    if (!vehicleData.year) errors.push('Missing vehicle year');
    
    // Additional validation for data quality
    if (vehicleData.year && (isNaN(Number(vehicleData.year)) || Number(vehicleData.year) < 1900 || Number(vehicleData.year) > new Date().getFullYear() + 1)) {
      errors.push(`Invalid year: ${vehicleData.year}`);
    }
    
    if (vehicleData.price && (isNaN(Number(vehicleData.price)) || Number(vehicleData.price) <= 0)) {
      errors.push(`Invalid price: ${vehicleData.price}`);
    }
    
    if (vehicleData.mileage && (isNaN(Number(vehicleData.mileage)) || Number(vehicleData.mileage) < 0)) {
      errors.push(`Invalid mileage: ${vehicleData.mileage}`);
    }
    
    // VIN validation (basic length check)
    if (vehicleData.vin && (typeof vehicleData.vin !== 'string' || vehicleData.vin.length !== 17)) {
      errors.push(`Invalid VIN format: ${vehicleData.vin}`);
    }
    
    return errors;
  }
  
  /**
   * Generate analysis that clearly indicates an error occurred
   */
  private generateErrorAnalysis(vehicleData: any, error: any): any {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return {
      reliability: `Unable to provide reliability analysis due to data extraction issues: ${errorMessage}. Please verify the vehicle details manually or try a different listing.`,
      
      marketValue: `Market value analysis is unavailable due to data extraction issues: ${errorMessage}. To get an accurate market value assessment, please provide more specific vehicle details.`,
      
      maintenanceNeeds: `Maintenance needs analysis is unavailable due to data extraction issues: ${errorMessage}. For maintenance information, please provide the vehicle's make, model, year, and mileage.`,
      
      redFlags: `Red flags analysis is unavailable due to data extraction issues: ${errorMessage}. Please verify that the listing URL is valid and accessible.`,
      
      recommendation: `I cannot provide a recommendation due to data extraction issues: ${errorMessage}. Please try again with a different listing URL or provide the vehicle details manually.`,
      
      error: true,
      errorDetails: errorMessage
    };
  }
  
  /**
   * Get content that clearly indicates limitations due to missing data
   */
  private getLimitationsContentForField(field: string, vehicleData: any): string {
    const vehicleDesc = this.getVehicleDescription(vehicleData);
    
    switch (field) {
      case 'reliability':
        return `Limited reliability analysis for ${vehicleDesc}: Not enough specific data was provided to give a detailed reliability assessment. For an accurate reliability analysis, I would need the exact make, model, and year of the vehicle.`;
      
      case 'marketValue':
        return `Limited market value analysis for ${vehicleDesc}: ${!vehicleData.price ? 'No price information was provided. ' : ''}${!vehicleData.mileage ? 'No mileage information was provided. ' : ''}Without complete pricing and vehicle condition details, I cannot accurately assess the market value. Please provide more specific information for a proper market analysis.`;
      
      case 'maintenanceNeeds':
        return `Limited maintenance needs analysis for ${vehicleDesc}: ${!vehicleData.mileage ? 'No mileage information was provided. ' : ''}Without specific details about the vehicle's history and current condition, I can only provide general maintenance recommendations. Please provide more information for specific maintenance guidance.`;
      
      case 'redFlags':
        return `Limited red flags analysis for ${vehicleDesc}: Without complete listing details, I cannot identify specific concerns. Generally, you should be cautious about listings with limited information, no photos, vague descriptions, or pricing that seems too good to be true. Always inspect the vehicle in person and consider a professional inspection.`;
      
      case 'recommendation':
        return `Cannot provide a recommendation for ${vehicleDesc}: There is insufficient information to make a responsible recommendation about this vehicle. I recommend gathering more specific details about this vehicle, including a vehicle history report, service records, and a professional inspection before making a purchase decision.`;
      
      default:
        return `Limited analysis available: Insufficient data was provided to analyze this aspect of the vehicle listing.`;
    }
  }
  
  /**
   * Get a descriptive string for the vehicle
   */
  private getVehicleDescription(vehicleData: any): string {
    let desc = '';
    
    if (vehicleData.year) desc += `${vehicleData.year} `;
    if (vehicleData.make) desc += `${vehicleData.make} `;
    if (vehicleData.model) desc += `${vehicleData.model}`;
    
    if (desc.trim()) {
      return desc.trim();
    }
    
    if (vehicleData.vin) {
      return `vehicle with VIN ${vehicleData.vin}`;
    }
    
    return 'the vehicle in this listing';
  }
}
