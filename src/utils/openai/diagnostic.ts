
import { supabase } from '@/integrations/supabase/client';

/**
 * Get diagnostic information for a DTC code or symptoms
 */
export async function getDiagnosticInfo(params: { 
  dtcCode?: string; 
  vehicleInfo?: any; 
  symptoms?: string[];
  noStart?: boolean;
}) {
  try {
    const { data, error } = await supabase.functions.invoke('openai', {
      body: {
        service: 'diagnostic',
        action: 'analyze',
        data: params
      }
    });

    if (error) throw new Error(error.message);
    return data.diagnostic;
  } catch (error) {
    console.error('Error getting diagnostic information:', error);
    throw error;
  }
}
