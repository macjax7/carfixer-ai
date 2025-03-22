
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
        errorMessage: extractedData.data.errorMessage || 'Could not extract vehicle information from the provided link.',
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
    
    // Verify essential data before analysis
    if (!extractedData.data.make || !extractedData.data.model || !extractedData.data.year) {
      console.warn('Missing essential vehicle data for analysis');
      
      return createSuccessResponse({
        ...extractedData.data,
        extractionWarning: true,
        errorMessage: 'Some essential vehicle details could not be extracted from the listing.',
        analysis: {
          reliability: "I couldn't extract complete vehicle information to provide a reliable analysis.",
          marketValue: "Market value assessment requires complete vehicle details that weren't available in this listing.",
          maintenanceNeeds: "I need more vehicle details to provide maintenance information.",
          redFlags: "The listing appears to be missing essential vehicle information which is a concern.",
          recommendation: "I recommend finding a more detailed listing or manually providing the missing vehicle details for a complete analysis."
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
