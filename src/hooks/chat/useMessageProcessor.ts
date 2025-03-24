
import { useState, useCallback } from "react";
import { useUserMessageProcessor } from "./useUserMessageProcessor";
import { useAIResponseProcessor } from "./useAIResponseProcessor";
import { useAIMessageCreator } from "./useAIMessageCreator";

export const useMessageProcessor = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { processUserMessage } = useUserMessageProcessor();
  const { processAIResponse, currentVehicleContext } = useAIResponseProcessor();
  const { createAIMessage } = useAIMessageCreator();

  return {
    isProcessing,
    setIsProcessing,
    processUserMessage,
    processAIResponse,
    createAIMessage,
    currentVehicleContext
  };
};
