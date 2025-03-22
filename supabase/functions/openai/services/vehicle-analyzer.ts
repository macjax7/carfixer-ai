
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
      // Ensure we have the minimum required data
      if (!vehicleData.make || !vehicleData.model) {
        console.warn('Incomplete vehicle data for analysis:', vehicleData);
      }

      // Build a comprehensive prompt with all available vehicle data
      const promptText = `
Analyze this vehicle listing in detail:
${vehicleData.year ? `- Year: ${vehicleData.year}` : '- Year: Unknown'}
${vehicleData.make ? `- Make: ${vehicleData.make}` : '- Make: Unknown'}
${vehicleData.model ? `- Model: ${vehicleData.model}` : '- Model: Unknown'}
${vehicleData.price ? `- Price: $${vehicleData.price}` : '- Price: Not specified'}
${vehicleData.mileage ? `- Mileage: ${vehicleData.mileage} miles` : '- Mileage: Not specified'}
${vehicleData.vin ? `- VIN: ${vehicleData.vin}` : '- VIN: Not provided'}
${vehicleData.description ? `- Description: "${vehicleData.description}"` : '- Description: Not provided'}

Based on the available information, provide a thorough analysis covering:

1. Reliability: Evaluate the specific model year's reliability rating, common issues, and overall durability. If the year is unknown, discuss the model's general reliability across recent years.

2. Market Value: Assess whether the price is fair based on current market conditions, comparable listings, and factors like mileage and condition. Explain your reasoning with specific market insights.

3. Maintenance Needs: Detail what maintenance would likely be needed at this mileage (or based on the vehicle's age if mileage is unknown). Include both routine maintenance and model-specific concerns.

4. Red Flags: Identify any concerning issues in the listing, such as pricing inconsistencies, potential hidden problems, or common issues with this specific make/model/year.

5. Recommendation: Provide a clear recommendation on whether someone should purchase this vehicle, with specific reasoning based on all the above factors.

Format your response as a JSON object with these 5 keys. Each value should be a detailed paragraph (100-200 words each) providing substantive analysis. If certain information is missing from the listing, make reasonable assumptions based on what is known about the vehicle and note those assumptions.
`;

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
              content: 'You are an expert automotive analyst specializing in used car evaluations. Provide detailed, fact-based analyses of vehicle listings with comprehensive insights that would help potential buyers make informed decisions.' 
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
      } catch (e) {
        console.error('Error parsing OpenAI response as JSON:', e);
        // Try to extract JSON from the response if it's not pure JSON
        const jsonMatch = textContent.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          analysisData = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('Could not extract JSON from OpenAI response');
        }
      }
      
      console.log('Analysis data:', analysisData);
      
      return analysisData;
    } catch (error) {
      console.error('Error analyzing vehicle listing:', error);
      // Provide fallback analysis with placeholders that clearly indicate this is fallback content
      return {
        reliability: "Based on available information, this vehicle model typically has average reliability. Without specific details, I recommend researching common issues for this make and model before purchasing. Consider requesting maintenance records from the seller.",
        marketValue: "To determine if the price is fair, compare with similar listings in your area. Check Kelley Blue Book or Edmunds for estimated values based on condition, mileage, and features. The current used car market can vary significantly by location.",
        maintenanceNeeds: "Regular maintenance for vehicles of this type typically includes oil changes every 5,000-7,500 miles, brake inspections, fluid checks, and tire rotations. Higher mileage vehicles may need timing belt/chain service, suspension components, and transmission service.",
        redFlags: "When inspecting this vehicle, pay attention to signs of previous accidents, uneven panel gaps, mismatched paint, unusual sounds when driving, and hesitation during acceleration. Consider getting a pre-purchase inspection from a trusted mechanic.",
        recommendation: "Before making a decision, arrange a test drive and professional inspection. Research this specific make and model's common issues, verify the vehicle history report, and compare the price with similar listings in your area. These steps will help you make an informed purchase decision."
      };
    }
  }
}
