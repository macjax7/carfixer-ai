
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

/**
 * Analyze a vehicle listing URL
 */
export async function analyzeVehicleListing(url: string) {
  try {
    console.log('Analyzing vehicle listing URL:', url);
    
    // Call the Supabase Edge Function to analyze the listing
    const { data, error } = await supabase.functions.invoke('openai', {
      body: {
        service: 'vehicle',
        action: 'listing-analysis',
        data: { url }
      }
    });

    if (error) {
      console.error('Error from Supabase function:', error);
      throw new Error(error.message);
    }
    
    if (!data) {
      throw new Error('No data returned from vehicle listing analysis');
    }
    
    // Check for extraction reliability flag
    if (data.unreliableExtraction) {
      console.warn('Vehicle data extraction was unreliable', data);
      throw new Error('Could not reliably extract vehicle information from the provided link');
    }
    
    // Verify essential data was extracted
    if (!data.make && !data.model && !data.year) {
      console.warn('Missing essential vehicle data (make, model, or year):', data);
      throw new Error('Could not extract basic vehicle information from the provided link');
    }
    
    console.log('Vehicle listing analysis complete:', data);
    return data;
  } catch (error) {
    console.error('Error analyzing vehicle listing:', error);
    throw error;
  }
}
