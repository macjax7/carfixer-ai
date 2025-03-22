
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
    
    console.log('Vehicle listing analysis complete:', data);
    return data;
  } catch (error) {
    console.error('Error analyzing vehicle listing:', error);
    throw error;
  }
}
