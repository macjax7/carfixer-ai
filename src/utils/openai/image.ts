
import { supabase } from '@/integrations/supabase/client';

/**
 * Analyze an image using OpenAI's vision capabilities
 */
export async function analyzeImage(imageUrl: string, prompt?: string, vehicleInfo = null) {
  try {
    const { data, error } = await supabase.functions.invoke('openai', {
      body: {
        service: 'image',
        action: 'analyze',
        data: {
          image: imageUrl,
          prompt,
          vehicleInfo
        }
      }
    });

    if (error) throw new Error(error.message);
    return data.analysis;
  } catch (error) {
    console.error('Error analyzing image:', error);
    throw error;
  }
}
