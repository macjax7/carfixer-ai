
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
    console.log("Processing image-based query:", { 
      imageUrlLength: image?.length || 0,
      textPrompt: text,
      hasVehicleInfo: !!vehicleInfo 
    });
    
    try {
      // Create default prompt if user didn't provide one
      const effectivePrompt = text.trim() || "Can you identify this car part?";
      
      // Process the image with the OpenAI vision API
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
      throw error;
    }
  }, [identifyPart]);

  return { processImage };
};
