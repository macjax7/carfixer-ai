
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
      const promptText = `
Analyze this vehicle listing:
- ${vehicleData.year} ${vehicleData.make} ${vehicleData.model}
- Price: $${vehicleData.price}
- Mileage: ${vehicleData.mileage} miles
${vehicleData.vin ? `- VIN: ${vehicleData.vin}` : ''}
${vehicleData.description ? `- Description: "${vehicleData.description}"` : ''}

Provide a detailed analysis of:
1. Reliability: Common issues for this specific model year and reliability rating
2. Market Value: Is the price fair based on current market conditions? Explain why
3. Maintenance Needs: What maintenance would be expected at this mileage?
4. Red Flags: Any concerning issues to look out for with this specific vehicle
5. Recommendation: Should someone purchase this vehicle? Why or why not?

Return your response as a JSON object with these 5 keys, with concise but informative values for each.
Just respond with the JSON, no explanations.
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
            { role: 'system', content: 'You are an expert automotive analyst specializing in used car evaluations. Provide detailed, fact-based analyses of vehicle listings.' },
            { role: 'user', content: promptText }
          ],
          temperature: 0.4,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('OpenAI API error:', errorData);
        throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
      }

      const result = await response.json();
      const textContent = result.choices[0].message.content;
      
      // Extract JSON from the response
      const jsonMatch = textContent.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Could not extract JSON from OpenAI response');
      }
      
      const analysisData = JSON.parse(jsonMatch[0]);
      console.log('Analysis data:', analysisData);
      
      return analysisData;
    } catch (error) {
      console.error('Error analyzing vehicle listing:', error);
      return {
        reliability: "Sorry, couldn't analyze the reliability of this vehicle.",
        marketValue: "Unable to determine the market value at this time.",
        maintenanceNeeds: "Couldn't assess maintenance needs for this vehicle.",
        redFlags: "No specific red flags identified. Perform a standard inspection.",
        recommendation: "Consider getting a professional inspection before purchasing."
      };
    }
  }
}
