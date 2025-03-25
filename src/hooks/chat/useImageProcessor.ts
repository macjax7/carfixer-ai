
import { useCallback } from "react";
import { useOpenAI } from "@/utils/openai/hook";

export const useImageProcessor = () => {
  const { identifyPart } = useOpenAI();

  /**
   * Process an image with optional custom prompt
   */
  const processImage = useCallback(async (
    image: string,
    text: string,
    vehicleInfo?: any
  ) => {
    console.log("processImage called with:", { 
      imageType: typeof image,
      imageLength: image?.length || 0,
      textPrompt: text,
      hasVehicleInfo: !!vehicleInfo,
      isBlobURL: image?.startsWith('blob:') || false
    });
    
    try {
      // Validate image URL
      if (!image) {
        throw new Error('No image URL provided');
      }
      
      // Create default prompt if user didn't provide one
      const effectivePrompt = text.trim() || "Can you identify this car part?";
      
      console.log("Calling identifyPart with prompt:", effectivePrompt);
      
      // Process the image with the OpenAI vision API - pass the vehicle context
      const imageResult = await identifyPart(image, effectivePrompt, vehicleInfo);
      console.log("Image identification result received, length:", imageResult?.length || 0);
      
      // Look for component diagram data in the response
      let componentDiagram = null;
      const diagramRegex = /{COMPONENT_DIAGRAM:\s*({.*?})}/s;
      const match = imageResult.match(diagramRegex);
      
      if (match && match[1]) {
        try {
          componentDiagram = JSON.parse(match[1]);
          console.log("Extracted component diagram from image analysis:", componentDiagram);
        } catch (e) {
          console.error("Failed to parse component diagram data:", e);
        }
      }
      
      // Return both the text analysis and any extracted component diagram
      return { 
        text: imageResult, 
        extra: componentDiagram ? { componentDiagram } : {} 
      };
    } catch (error) {
      console.error("Error processing image:", error);
      
      // Create a more user-friendly error message
      let errorMessage = "I couldn't analyze this image.";
      
      if (error?.message?.includes("timed out")) {
        errorMessage += " The analysis took too long. Please try a smaller or clearer image.";
      } else if (error?.message?.includes("too large")) {
        errorMessage += " The image is too large. Please use an image smaller than 8MB.";
      } else if (error?.message?.includes("Invalid image")) {
        errorMessage += " The image format appears to be invalid. Please try a different image.";
      } else {
        errorMessage += " Please try again with a clearer image of the car part.";
      }
      
      return {
        text: errorMessage,
        extra: { error: true }
      };
    }
  }, [identifyPart]);

  return { processImage };
};
