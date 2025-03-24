
import { VehiclePromptBuilder } from './prompt-builder.ts';
import { VehicleDataValidator } from './data-validator.ts';
import { ResponseFormatter } from './response-formatter.ts';
import { OpenAIApiService } from './openai-service.ts';

/**
 * Service for analyzing vehicle data
 */
export class VehicleAnalyzerService {
  private promptBuilder: VehiclePromptBuilder;
  private dataValidator: VehicleDataValidator;
  private responseFormatter: ResponseFormatter;
  private openAIService: OpenAIApiService;
  
  constructor() {
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key is not set in environment variables');
    }
    
    this.promptBuilder = new VehiclePromptBuilder();
    this.dataValidator = new VehicleDataValidator();
    this.responseFormatter = new ResponseFormatter();
    this.openAIService = new OpenAIApiService(openAIApiKey);
  }
  
  /**
   * Analyze vehicle listing data to provide insights
   */
  async analyzeVehicleListing(vehicleData: any) {
    try {
      // Validate the input data to ensure we have basic required information
      const validationErrors = this.dataValidator.validateVehicleData(vehicleData);
      
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
      const promptText = this.promptBuilder.buildAnalysisPrompt(vehicleData);
      
      // Call OpenAI API to analyze the vehicle
      const textContent = await this.openAIService.analyzeVehicle(promptText);
      
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
            analysisData[field] = this.responseFormatter.getLimitationsContentForField(field, vehicleData);
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
      return this.responseFormatter.generateErrorAnalysis(vehicleData, error);
    }
  }
}
