
import { corsHeaders, createSuccessResponse, createErrorResponse } from '../utils.ts';
import { ListingExtractorService } from '../services/listing-extractor.ts';
import { VehicleAnalyzerService } from '../services/vehicle-analyzer.ts';

/**
 * Handle vehicle listing analysis requests
 */
export async function handleVehicleListing(data: any) {
  try {
    const { url } = data;
    
    if (!url) {
      throw new Error('No URL provided for vehicle listing analysis');
    }
    
    console.log('Analyzing vehicle listing:', url);
    
    // Extract data from the listing URL
    const listingExtractor = new ListingExtractorService();
    const extractedData = await listingExtractor.extractListingData(url);
    
    if (!extractedData.success) {
      throw new Error('Failed to extract data from listing URL: ' + extractedData.error);
    }
    
    // Perform AI analysis on the extracted data
    const vehicleAnalyzer = new VehicleAnalyzerService();
    const analysis = await vehicleAnalyzer.analyzeVehicleListing(extractedData.data);
    
    return createSuccessResponse({
      ...extractedData.data,
      analysis,
      url
    });
  } catch (error) {
    console.error('Error in vehicle listing handler:', error);
    return createErrorResponse(error);
  }
}
