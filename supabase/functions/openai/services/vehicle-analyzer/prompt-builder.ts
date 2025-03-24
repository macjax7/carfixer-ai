
/**
 * Service for building analysis prompts for vehicle listings
 */
export class VehiclePromptBuilder {
  /**
   * Build a comprehensive prompt for vehicle analysis
   */
  buildAnalysisPrompt(vehicleData: any): string {
    return `
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
  }
}
