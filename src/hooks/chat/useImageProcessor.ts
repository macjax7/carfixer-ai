
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
    console.log("Processing image-based query with vehicle info:", vehicleInfo);
    const imageResult = await identifyPart(image, text);
    
    const aiResponseText = imageResult.text;
    let aiMessageExtra = {};
    
    if (imageResult.componentDiagram) {
      aiMessageExtra = { componentDiagram: imageResult.componentDiagram };
    }
    
    return { text: aiResponseText, extra: aiMessageExtra };
  }, [identifyPart]);

  return { processImage };
};
