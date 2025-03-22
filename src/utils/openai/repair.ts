
import { supabase } from '@/integrations/supabase/client';

/**
 * Get repair guidance
 */
export async function getRepairGuidance(params: {
  repairType: string;
  vehicleInfo?: any;
  partName?: string;
  dtcCode?: string;
}) {
  try {
    const { data, error } = await supabase.functions.invoke('openai', {
      body: {
        service: 'repair',
        action: 'guide',
        data: params
      }
    });

    if (error) throw new Error(error.message);
    return data.guidance;
  } catch (error) {
    console.error('Error getting repair guidance:', error);
    throw error;
  }
}
