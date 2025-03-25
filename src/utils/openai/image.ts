
import { supabase } from '@/integrations/supabase/client';

/**
 * Analyze an image using OpenAI's vision capabilities
 */
export async function analyzeImage(imageUrl: string, prompt?: string, vehicleInfo = null) {
  try {
    console.log("analyzeImage called with:", { 
      imageType: typeof imageUrl,
      imageLength: imageUrl?.length || 0,
      hasPrompt: !!prompt, 
      hasVehicleInfo: !!vehicleInfo,
      isBlobURL: imageUrl?.startsWith('blob:') || false
    });
    
    // Set default prompt if not provided
    const effectivePrompt = prompt || 'Identify this car part and explain its purpose and function in detail.';
    
    // Validate the image URL
    if (!imageUrl) {
      throw new Error('No image URL provided');
    }
    
    // Handle blob URLs by fetching and converting to data URL
    if (imageUrl.startsWith('blob:')) {
      console.log("Processing blob URL...");
      
      try {
        // Create a new fetch request to get the blob data
        const response = await fetch(imageUrl);
        if (!response.ok) {
          throw new Error(`Failed to fetch blob URL: ${response.status} ${response.statusText}`);
        }
        
        // Get the blob data
        const blob = await response.blob();
        console.log("Blob data fetched:", {
          type: blob.type,
          size: `${(blob.size / 1024).toFixed(2)}KB`
        });
        
        if (blob.size > 8 * 1024 * 1024) {
          throw new Error('Image is too large. Maximum size is 8MB');
        }
        
        // Convert the blob to a data URL
        imageUrl = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = () => reject(new Error('Failed to convert blob to data URL'));
          reader.readAsDataURL(blob);
        });
        
        console.log("Blob converted to data URL successfully:", {
          dataURLLength: imageUrl.length,
          dataURLPrefix: imageUrl.substring(0, 30) + '...'
        });
      } catch (error) {
        console.error("Error processing blob URL:", error);
        throw new Error(`Failed to process image: ${error.message}`);
      }
    }
    
    // Verify image format before sending to edge function
    if (typeof imageUrl !== 'string') {
      throw new Error('Image data is not a string');
    }
    
    if (!imageUrl.startsWith('data:') && !imageUrl.startsWith('http')) {
      throw new Error('Image must be a data URL or http URL');
    }
    
    console.log("Calling Supabase function with image data:", {
      promptLength: effectivePrompt.length,
      imageURLLength: imageUrl.length,
      imageURLStart: imageUrl.substring(0, 30) + '...'
    });
    
    // Set up a timeout for the Supabase function call
    const functionTimeout = 25000; // 25 seconds
    
    // Create a promise that will reject after the timeout
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Image analysis timed out after 25 seconds')), functionTimeout);
    });
    
    // Create the promise for the Supabase function call
    const functionPromise = supabase.functions.invoke('openai', {
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
    
    // Race the promises - whichever resolves/rejects first wins
    const result = await Promise.race([functionPromise, timeoutPromise]) as any;
    
    if (result.error) {
      console.error("Error from Supabase function:", result.error);
      throw new Error(`Error from image analysis: ${result.error.message || 'Unknown error'}`);
    }
    
    if (!result.data || !result.data.analysis) {
      console.error("Invalid response from image analysis:", result.data);
      throw new Error('Invalid response from image analysis');
    }
    
    console.log("Successfully received image analysis:", {
      analysisLength: result.data.analysis.length,
      analysisStart: result.data.analysis.substring(0, 50) + '...'
    });
    
    return result.data.analysis;
  } catch (error) {
    console.error("Error in analyzeImage:", error);
    throw error;
  }
}
