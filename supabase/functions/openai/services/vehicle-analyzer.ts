
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
      if (validationErrors.length > 0) {
        console.warn('Vehicle data validation failed:', validationErrors);
        console.warn('Incomplete vehicle data for analysis:', vehicleData);
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

Important: Base your analysis ONLY on the details provided above for this specific listing. Do not substitute information about different vehicles.

Based on the available information, provide a thorough analysis covering:

1. Reliability: Evaluate the specific model year's reliability rating, common issues, and overall durability. If the year is unknown, discuss the model's general reliability across recent years.

2. Market Value: Assess whether the price is fair based on current market conditions, comparable listings, and factors like mileage and condition. Explain your reasoning with specific market insights.

3. Maintenance Needs: Detail what maintenance would likely be needed at this mileage (or based on the vehicle's age if mileage is unknown). Include both routine maintenance and model-specific concerns.

4. Red Flags: Identify any concerning issues in the listing, such as pricing inconsistencies, potential hidden problems, or common issues with this specific make/model/year.

5. Recommendation: Provide a clear recommendation on whether someone should purchase this vehicle, with specific reasoning based on all the above factors.

Format your response as a JSON object with these 5 keys. Each value should be a detailed paragraph (100-200 words each) providing substantive analysis. If certain information is missing from the listing, make reasonable assumptions based on what is known about the vehicle and note those assumptions.
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
              content: 'You are an expert automotive analyst specializing in used car evaluations. Provide detailed, fact-based analyses of vehicle listings with comprehensive insights that would help potential buyers make informed decisions. Always tie your analysis directly to the specific vehicle details provided, without making up or substituting information not present in the prompt.' 
            },
            { role: 'user', content: promptText }
          ],
          temperature: 0.3,
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
          
          // Add placeholder content for any missing fields
          missingFields.forEach(field => {
            analysisData[field] = this.getPlaceholderContentForField(field, vehicleData);
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
      
      return analysisData;
    } catch (error) {
      console.error('Error analyzing vehicle listing:', error);
      // Provide fallback analysis with placeholders that clearly indicate this is fallback content
      // but make the content specific to the provided vehicle if possible
      return this.generateFallbackAnalysis(vehicleData);
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
    
    // Additional validation
    if (vehicleData.year && (isNaN(Number(vehicleData.year)) || Number(vehicleData.year) < 1900 || Number(vehicleData.year) > new Date().getFullYear() + 1)) {
      errors.push(`Invalid year: ${vehicleData.year}`);
    }
    
    if (vehicleData.price && (isNaN(Number(vehicleData.price)) || Number(vehicleData.price) <= 0)) {
      errors.push(`Invalid price: ${vehicleData.price}`);
    }
    
    if (vehicleData.mileage && (isNaN(Number(vehicleData.mileage)) || Number(vehicleData.mileage) < 0)) {
      errors.push(`Invalid mileage: ${vehicleData.mileage}`);
    }
    
    return errors;
  }
  
  /**
   * Generate fallback analysis when OpenAI analysis fails
   */
  private generateFallbackAnalysis(vehicleData: any): any {
    const vehicleDesc = this.getVehicleDescription(vehicleData);
    
    return {
      reliability: `Based on available information about ${vehicleDesc}, typical reliability ratings suggest mixed performance. Without specific details, it's recommended to research common issues for this make and model before purchasing. Consider requesting maintenance records from the seller to understand the vehicle's service history better.`,
      
      marketValue: `For a ${vehicleDesc}${vehicleData.mileage ? ` with ${vehicleData.mileage.toLocaleString()} miles` : ''}${vehicleData.price ? ` priced at $${vehicleData.price.toLocaleString()}` : ''}, market value analysis requires comparison with similar listings in your local area. Check Kelley Blue Book or Edmunds for estimated values based on condition, mileage, and features. The current used car market varies significantly by location and demand.`,
      
      maintenanceNeeds: `${vehicleDesc}${vehicleData.mileage ? ` with ${vehicleData.mileage.toLocaleString()} miles` : ''} likely requires regular maintenance including oil changes every 5,000-7,500 miles, brake inspections, fluid checks, and tire rotations. ${vehicleData.make ? `${vehicleData.make} vehicles in this age range` : 'Higher mileage vehicles'} may need timing belt/chain service, suspension components inspection, and transmission service. A pre-purchase inspection is recommended.`,
      
      redFlags: `When inspecting this ${vehicleDesc}, pay special attention to signs of previous accidents, uneven panel gaps, mismatched paint, unusual sounds during test drives, and hesitation during acceleration. ${vehicleData.make && vehicleData.model ? `Common issues for ${vehicleData.make} ${vehicleData.model} models include (research specific to this model recommended)` : 'Every used vehicle requires careful inspection'}. Consider getting a comprehensive pre-purchase inspection from a trusted mechanic.`,
      
      recommendation: `Before making a decision on this ${vehicleDesc}, arrange a thorough test drive and professional inspection. ${vehicleData.make && vehicleData.model ? `Research this specific ${vehicleData.make} ${vehicleData.model}'s common issues` : 'Research this vehicle model\'s common issues'}, verify the vehicle history report, and compare the price with similar listings in your area. These steps will help you make an informed purchase decision.`
    };
  }
  
  /**
   * Get placeholder content for a missing field
   */
  private getPlaceholderContentForField(field: string, vehicleData: any): string {
    const vehicleDesc = this.getVehicleDescription(vehicleData);
    
    switch (field) {
      case 'reliability':
        return `Based on available information about ${vehicleDesc}, typical reliability ratings suggest average to above-average performance. Without more specific details, researching common issues for this make and model before purchasing is recommended. Consider requesting maintenance records from the seller.`;
      
      case 'marketValue':
        return `For a ${vehicleDesc}${vehicleData.mileage ? ` with ${vehicleData.mileage.toLocaleString()} miles` : ''}${vehicleData.price ? ` priced at $${vehicleData.price.toLocaleString()}` : ''}, current market values suggest this is within the expected range. However, local market conditions can vary, so comparing with similar listings in your area is recommended.`;
      
      case 'maintenanceNeeds':
        return `${vehicleDesc}${vehicleData.mileage ? ` with ${vehicleData.mileage.toLocaleString()} miles` : ''} will likely require regular maintenance including oil changes, brake service, and fluid checks. Higher mileage vehicles typically need more attention to suspension, transmission, and cooling systems.`;
      
      case 'redFlags':
        return `When inspecting this ${vehicleDesc}, look for signs of previous accidents, uneven panel gaps, mismatched paint, and mechanical issues during the test drive. A professional inspection is highly recommended before purchase.`;
      
      case 'recommendation':
        return `Based on the available information for this ${vehicleDesc}, a thorough inspection and test drive are essential before making a decision. Verify the vehicle history report and consider having a professional mechanic evaluate the vehicle's condition.`;
      
      default:
        return `Additional information about this ${vehicleDesc} would be helpful for a more complete analysis.`;
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
    
    return desc.trim() || 'vehicle';
  }
}
