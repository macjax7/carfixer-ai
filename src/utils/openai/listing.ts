
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

/**
 * Analyze a vehicle listing URL
 */
export async function analyzeVehicleListing(url: string) {
  try {
    console.log('Analyzing vehicle listing URL:', url);
    
    // Make sure the URL is properly formatted
    let cleanUrl = url.trim();
    
    // Check if URL is valid
    try {
      new URL(cleanUrl);
    } catch (error) {
      console.error('Invalid URL format:', cleanUrl);
      throw new Error('Please provide a valid vehicle listing URL');
    }
    
    // Call the Supabase Edge Function to analyze the listing
    const { data, error } = await supabase.functions.invoke('openai', {
      body: {
        service: 'vehicle',
        action: 'listing-analysis',
        data: { url: cleanUrl }
      }
    });

    if (error) {
      console.error('Error from Supabase function:', error);
      throw new Error(`Error analyzing vehicle listing: ${error.message}`);
    }
    
    if (!data) {
      throw new Error('No data returned from vehicle listing analysis');
    }
    
    // Check for extraction reliability flag
    if (data.extractionFailed || data.unreliableExtraction) {
      console.warn('Vehicle data extraction was unreliable or failed', data);
      let errorMessage = data.errorMessage || 'Could not reliably extract vehicle information from the provided link';
      throw new Error(errorMessage);
    }
    
    // Verify essential data was extracted
    if (!data.make && !data.model && !data.year) {
      console.warn('Missing essential vehicle data (make, model, or year):', data);
      throw new Error('Could not extract basic vehicle information from the provided link. The listing may require login or the URL may be invalid.');
    }
    
    console.log('Vehicle listing analysis complete:', data);
    return data;
  } catch (error) {
    console.error('Error analyzing vehicle listing:', error);
    throw error;
  }
}
