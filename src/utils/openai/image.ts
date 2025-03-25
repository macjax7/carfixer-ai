
import { supabase } from '@/integrations/supabase/client';

/**
 * Analyze an image using OpenAI's vision capabilities
 */
export async function analyzeImage(imageUrl: string, prompt?: string, vehicleInfo = null) {
  try {
    console.log("Analyzing image with OpenAI vision API:", { 
      imageUrlLength: imageUrl?.length || 0,
      hasPrompt: !!prompt, 
      hasVehicleInfo: !!vehicleInfo 
    });
    
    // Set default prompt if not provided
    const effectivePrompt = prompt || 'Identify this car part and explain its purpose and function in detail.';
    
    const { data, error } = await supabase.functions.invoke('openai', {
      body: {
        service: 'image',
        action: 'analyze',
        data: {
          image: imageUrl,
          prompt: effectivePrompt,
          vehicleInfo
        }
      }
    });

    if (error) {
      console.error("Error from Supabase image analysis function:", error);
      throw new Error(error.message);
    }
    
    console.log("Image analysis successful, response length:", data?.analysis?.length || 0);
    return data.analysis;
  } catch (error) {
    console.error('Error analyzing image:', error);
    throw error;
  }
}
