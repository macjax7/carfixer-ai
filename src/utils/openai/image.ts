
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
    
    // Validate the image URL
    if (!imageUrl) {
      throw new Error('No image URL provided');
    }
    
    // Check if the image is a data URL or an object URL
    if (!imageUrl.startsWith('data:') && !imageUrl.startsWith('blob:') && !imageUrl.startsWith('http')) {
      console.error("Invalid image URL format:", imageUrl.substring(0, 20) + '...');
      throw new Error('Invalid image URL format');
    }
    
    // For object URLs created with URL.createObjectURL, we need to fetch them first
    let processedImageUrl = imageUrl;
    if (imageUrl.startsWith('blob:')) {
      console.log("Converting blob URL to data URL");
      try {
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const reader = new FileReader();
        processedImageUrl = await new Promise((resolve) => {
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        });
        console.log("Successfully converted blob URL to data URL");
      } catch (error) {
        console.error("Error converting blob URL to data URL:", error);
        throw new Error('Failed to process image URL');
      }
    }
    
    // Ensure we're sending the complete data to the edge function
    const { data, error } = await supabase.functions.invoke('openai', {
      body: {
        service: 'image',
        action: 'analyze',
        data: {
          image: processedImageUrl,
          prompt: effectivePrompt,
          vehicleInfo
        }
      }
    });

    if (error) {
      console.error("Error from Supabase image analysis function:", error);
      throw new Error(error.message || 'Error analyzing image');
    }
    
    if (!data || !data.analysis) {
      console.error("Invalid response from image analysis function:", data);
      throw new Error('Invalid response from image analysis');
    }
    
    console.log("Image analysis successful, response length:", data?.analysis?.length || 0);
    return data.analysis;
  } catch (error) {
    console.error('Error analyzing image:', error);
    throw error;
  }
}
