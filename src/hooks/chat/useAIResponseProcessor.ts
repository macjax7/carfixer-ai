
import { useCallback, useState } from "react";
import { useVehicleContext } from "./useVehicleContext";
import { ChatMessage } from "@/utils/openai/types";
import { fetchRepairData } from "@/utils/openai/repair-data";
import { useSymptomExtractor } from "./extractors/useSymptomExtractor";
import { useRepairTaskExtractor } from "./extractors/useRepairTaskExtractor";
import { useAIErrorHandler } from "./handlers/useAIErrorHandler";
import { useOBDProcessor } from "./handlers/useOBDProcessor";
import { useImageProcessor } from "./handlers/useImageProcessor";
import { useTextProcessor } from "./handlers/useTextProcessor";
import { useOpenAI } from "@/utils/openai/hook";

export const useAIResponseProcessor = () => {
  const [currentVehicleContext, setCurrentVehicleContext] = useState<any>(null);
  const { vehicleContext } = useVehicleContext();
  const { extractSymptoms } = useSymptomExtractor();
  const { extractRepairTask } = useRepairTaskExtractor();
  const { handleSuccess, handleError, consecutiveErrorCount } = useAIErrorHandler();
  const { processOBDCodes } = useOBDProcessor();
  const { processImageQuery } = useImageProcessor();
  const { processTextQuery } = useTextProcessor();
  const { extractOBDCodes } = useOpenAI();

  const processAIResponse = useCallback(
    async (
      userMessage: string,
      image?: string,
      vehicleInfo = null,
      previousMessages: ChatMessage[] = []
    ): Promise<{ text: string; extra?: any }> => {
      try {
        const effectiveVehicleInfo = vehicleInfo || vehicleContext;
        setCurrentVehicleContext(effectiveVehicleInfo);

        // Extract OBD codes for specialized handling
        const obdCodes = extractOBDCodes(userMessage);
        
        // Extract potential repair task from the user message
        const repairTask = extractRepairTask(userMessage);
        
        // Extract symptoms from user message
        const symptoms = extractSymptoms(userMessage);
        
        // Fetch repair data if we have vehicle info and a potential repair task
        let repairContext = "";
        if (effectiveVehicleInfo && repairTask) {
          console.log("Fetching repair data for task:", repairTask);
          try {
            repairContext = await fetchRepairData(effectiveVehicleInfo, repairTask);
            console.log("Received repair context data:", repairContext ? "Yes" : "No");
          } catch (repairDataError) {
            console.error("Error fetching repair data:", repairDataError);
            // Continue without repair data if fetch fails
          }
        }

        // Create the enhanced prompt with vehicle context and repair data
        let enhancedUserMessage = userMessage;
        if (effectiveVehicleInfo) {
          enhancedUserMessage = `
Vehicle: ${effectiveVehicleInfo.year} ${effectiveVehicleInfo.make} ${effectiveVehicleInfo.model}

User Question: ${userMessage}
${repairContext ? `\nRelevant Repair Info:\n${repairContext}\n` : ''}
${repairContext ? 'Give a repair guide using this information.' : 'Respond with mechanic-level accuracy and include only details specific to this vehicle.'}
`;
        }

        console.log("Enhanced user message with vehicle context:", 
          effectiveVehicleInfo ? "Yes" : "No (no vehicle context available)");
        console.log("Enhanced user message with repair data:", 
          repairContext ? "Yes" : "No");

        try {
          // Handle specialized OBD code analysis if we have codes and vehicle info
          if (obdCodes.length > 0 && effectiveVehicleInfo) {
            const obdResult = await processOBDCodes(userMessage, effectiveVehicleInfo, handleSuccess);
            if (obdResult) return obdResult;
          }

          // Process image-based query if an image is provided
          if (image) {
            return await processImageQuery(image, enhancedUserMessage, handleSuccess);
          } 
          
          // Process text-based query
          // Prepare message history plus the new user message
          const messages: ChatMessage[] = [
            ...previousMessages,
            { role: "user", content: enhancedUserMessage }
          ];
          
          const response = await processTextQuery(messages, effectiveVehicleInfo, handleSuccess);
          
          return { 
            text: response, 
            extra: { 
              obdCodes: obdCodes.length > 0 ? obdCodes : undefined,
              image: image ? image : undefined 
            } 
          };
        } catch (error) {
          return handleError(error);
        }
      } catch (error) {
        console.error("Error processing AI response:", error);
        
        // Final fallback for unexpected errors
        return { 
          text: "I apologize for the inconvenience. I encountered an unexpected error while processing your request. Please try again.",
          extra: {}
        };
      }
    },
    [
      vehicleContext,
      extractSymptoms,
      extractRepairTask,
      extractOBDCodes,
      handleSuccess,
      handleError,
      processOBDCodes,
      processImageQuery,
      processTextQuery,
      consecutiveErrorCount
    ]
  );

  return {
    processAIResponse,
    currentVehicleContext,
  };
};
