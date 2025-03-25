
import { useCallback } from "react";
import { useOpenAI } from "@/utils/openai/hook";

export const useImageProcessor = () => {
  const { identifyPart } = useOpenAI();

  const processImageQuery = useCallback(async (
    image: string,
    enhancedUserMessage: string,
    handleSuccess: () => void
  ) => {
    console.log("Processing image-based query");
    const response = await identifyPart(image, enhancedUserMessage);
    
    // Mark the request as successful
    handleSuccess();
    
    return { 
      text: response, 
      extra: { image } 
    };
  }, [identifyPart]);

  return { processImageQuery };
};
