
import { useCallback } from "react";
import { useOpenAI } from "@/utils/openai/hook";
import { ChatMessage } from "@/utils/openai/types";

export const useTextProcessor = () => {
  const { chatWithAI } = useOpenAI();

  const processTextQuery = useCallback(async (
    messages: ChatMessage[],
    vehicleInfo: any,
    handleSuccess: () => void
  ) => {
    console.log("Processing text-based query");
    const response = await chatWithAI(messages, true, vehicleInfo);
    
    // Mark the request as successful
    handleSuccess();
    
    return response;
  }, [chatWithAI]);

  return { processTextQuery };
};
