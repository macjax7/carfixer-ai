
import { supabase } from '@/integrations/supabase/client';

/**
 * Look up part information
 */
export async function lookupPart(params: {
  partName: string;
  vehicleInfo?: any;
  partNumber?: string;
  oem?: boolean;
  aftermarket?: boolean;
}) {
  try {
    const { data, error } = await supabase.functions.invoke('openai', {
      body: {
        service: 'parts',
        action: 'lookup',
        data: params
      }
    });

    if (error) throw new Error(error.message);
    return data.parts;
  } catch (error) {
    console.error('Error looking up part:', error);
    throw error;
  }
}
