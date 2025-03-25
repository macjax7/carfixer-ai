
import { useState, useCallback } from "react";
import { useOpenAI } from "@/utils/openai/hook";

export const useTextProcessor = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { chatWithAI } = useOpenAI();

  const processTextQuery = useCallback(async (
    messages: any[],
    vehicleInfo: any,
    onSuccess: () => void
  ) => {
    setIsLoading(true);
    
    try {
      console.log("Processing text query with vehicle info:", 
        vehicleInfo ? `${vehicleInfo.year} ${vehicleInfo.make} ${vehicleInfo.model}` : "None");
      
      // Simple, direct call to the OpenAI API
      const response = await chatWithAI(messages, true, vehicleInfo);
      
      console.log("Successfully received AI response");
      
      // Call success handler
      onSuccess();
      
      return response;
    } catch (error) {
      console.error("Error processing text query:", error);
      throw error; // Let the caller handle the error
    } finally {
      setIsLoading(false);
    }
  }, [chatWithAI]);

  return {
    processTextQuery,
    isLoading
  };
};
