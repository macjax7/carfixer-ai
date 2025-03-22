
import { supabase } from '@/integrations/supabase/client';

/**
 * Decode a VIN number to get vehicle details
 */
export async function decodeVIN(vin: string) {
  try {
    const { data, error } = await supabase.functions.invoke('openai', {
      body: {
        service: 'vehicle',
        action: 'decode-vin',
        data: { vin }
      }
    });

    if (error) throw new Error(error.message);
    return data;
  } catch (error) {
    console.error('Error decoding VIN:', error);
    throw error;
  }
}

/**
 * Get live OBD-II sensor data
 */
export async function getOBDSensorData() {
  try {
    const { data, error } = await supabase.functions.invoke('openai', {
      body: {
        service: 'vehicle',
        action: 'fetch-sensors',
        data: {}
      }
    });

    if (error) throw new Error(error.message);
    return data.sensors;
  } catch (error) {
    console.error('Error getting OBD sensor data:', error);
    throw error;
  }
}
