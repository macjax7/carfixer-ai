
import { supabase } from '@/integrations/supabase/client';

/**
 * Analyze an image using OpenAI's vision capabilities
 */
export async function analyzeImage(imageUrl: string, prompt?: string, vehicleInfo = null) {
  try {
    console.log("Analyzing image with OpenAI vision API:", { 
      imageUrlType: typeof imageUrl,
      imageUrlLength: imageUrl?.length || 0,
      hasPrompt: !!prompt, 
      hasVehicleInfo: !!vehicleInfo,
      startsWithBlob: imageUrl?.startsWith('blob:') || false
    });
    
    // Set default prompt if not provided
    const effectivePrompt = prompt || 'Identify this car part and explain its purpose and function in detail.';
    
    // Validate the image URL
    if (!imageUrl) {
      throw new Error('No image URL provided');
    }
    
    // Process the image data - handle different formats properly
    let processedImageData = imageUrl;
    
    // For blob URLs created with URL.createObjectURL, we need to fetch and convert
    if (imageUrl.startsWith('blob:')) {
      console.log("Processing blob URL...");
      try {
        // Fetch the blob content
        const response = await fetch(imageUrl);
        if (!response.ok) {
          throw new Error(`Failed to fetch blob (status ${response.status})`);
        }
        
        // Get the blob data
        const blob = await response.blob();
        console.log("Blob fetched successfully:", {
          type: blob.type,
          size: `${(blob.size / 1024).toFixed(2)} KB`
        });
        
        // Check if the blob is too large (8MB limit for edge functions)
        if (blob.size > 8 * 1024 * 1024) {
          throw new Error('Image is too large. Maximum size is 8MB');
        }
        
        // Convert blob to base64 data URL using FileReader
        processedImageData = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = () => reject(new Error('Failed to read image data'));
          reader.readAsDataURL(blob);
        });
        
        console.log("Successfully converted blob to data URL:", {
          dataLength: processedImageData?.length || 0,
          dataPreview: processedImageData?.substring(0, 50) + '...' || ''
        });
      } catch (error) {
        console.error("Error processing blob URL:", error);
        throw new Error(`Failed to process image: ${error.message}`);
      }
    }
    
    // Ensure we're sending a valid format to the edge function
    if (typeof processedImageData !== 'string') {
      console.error("Invalid image data format - not a string");
      throw new Error('Image data is in an invalid format');
    }
    
    if (!processedImageData.startsWith('data:') && !processedImageData.startsWith('http')) {
      console.error("Invalid image data format after processing:", processedImageData.substring(0, 50));
      throw new Error('Image data is in an invalid format');
    }
    
    console.log("Sending image to OpenAI edge function:", { 
      dataLength: processedImageData.length,
      promptLength: effectivePrompt.length,
      dataPreview: processedImageData.substring(0, 50) + '...'
    });
    
    // Call the edge function with a timeout
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Image analysis timed out after 30 seconds')), 30000)
    );
    
    const analysisPromise = supabase.functions.invoke('openai', {
      body: {
        service: 'image',
        action: 'analyze',
        data: {
          image: processedImageData,
          prompt: effectivePrompt,
          vehicleInfo
        }
      }
    });
    
    // Race the analysis promise against the timeout
    const { data, error } = await Promise.race([analysisPromise, timeoutPromise]) as any;

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
