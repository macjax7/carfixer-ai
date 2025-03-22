
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
    
    // Handle extraction failures with clear error messages
    if (!extractedData.success) {
      console.warn('Data extraction failed:', extractedData.error);
      
      return createSuccessResponse({
        extractionFailed: true,
        unreliableExtraction: true,
        error: extractedData.error,
        url,
        errorMessage: 'Could not extract vehicle information from the provided link. The link may require authentication or the listing format is not supported.',
        ...extractedData.data
      });
    }
    
    // Check if data extraction was unreliable
    if (extractedData.data.unreliableExtraction) {
      console.warn('Data extraction was unreliable');
      
      return createSuccessResponse({
        ...extractedData.data,
        analysis: {
          reliability: "Unable to provide a reliability analysis as I couldn't extract sufficient vehicle information from the provided link.",
          marketValue: "I couldn't determine the market value as I was unable to extract sufficient vehicle information from the provided link.",
          maintenanceNeeds: "Maintenance needs cannot be determined without specific vehicle information, which I was unable to extract from the provided link.",
          redFlags: "I noticed a potential concern: I was unable to extract the vehicle details from this listing URL. This could mean the URL is invalid, requires authentication, or the listing has been removed.",
          recommendation: "I recommend sharing a different vehicle listing URL or manually providing the vehicle details (make, model, year, mileage, and price) for analysis."
        }
      });
    }
    
    // Perform AI analysis on the extracted data
    const vehicleAnalyzer = new VehicleAnalyzerService();
    const analysis = await vehicleAnalyzer.analyzeVehicleListing(extractedData.data);
    
    // Check if analysis returned an error flag
    if (analysis.error) {
      console.warn('Analysis returned error:', analysis.errorDetails);
      
      return createSuccessResponse({
        ...extractedData.data,
        analysisError: true,
        errorMessage: analysis.errorDetails || 'Error analyzing vehicle data',
        analysis
      });
    }
    
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
