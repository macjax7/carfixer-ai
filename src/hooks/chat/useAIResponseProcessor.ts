
import { useCallback, useState } from "react";
import { useOpenAI } from "@/utils/openai/hook";
import { useVehicleContext } from "./useVehicleContext";
import { ChatMessage } from "@/utils/openai/types";
import { fetchRepairData } from "@/utils/openai/repair-data";
import { useAIErrorHandler } from "./useAIErrorHandler";

export const useAIResponseProcessor = () => {
  const { chatWithAI, identifyPart } = useOpenAI();
  const [currentVehicleContext, setCurrentVehicleContext] = useState<any>(null);
  const { vehicleContext } = useVehicleContext();
  const { handleSuccess, handleError, errorCount } = useAIErrorHandler();

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

        // Extract potential repair task from the user message
        const repairTask = extractRepairTask(userMessage);
        
        // Detect if the message contains diagnostic trouble codes
        const containsDTCCode = /\b[PBCU][0-9]{4}\b/i.test(userMessage);
        
        // Special handling for technical diagnostics
        let repairContext = "";
        if (effectiveVehicleInfo && (repairTask || containsDTCCode)) {
          console.log("Fetching technical data for:", containsDTCCode ? "OBD-II code" : repairTask);
          try {
            repairContext = await fetchRepairData(
              effectiveVehicleInfo, 
              containsDTCCode ? extractDTCCodes(userMessage)[0] : repairTask
            );
            console.log("Received technical context data:", repairContext ? "Yes" : "No");
          } catch (dataError) {
            console.warn("Could not fetch repair data:", dataError);
            // Continue without the repair data if it fails
          }
        }

        // Create the enhanced prompt with vehicle context and repair data
        let enhancedUserMessage = userMessage;
        if (effectiveVehicleInfo) {
          enhancedUserMessage = `
Vehicle: ${effectiveVehicleInfo.year} ${effectiveVehicleInfo.make} ${effectiveVehicleInfo.model}

User Question: ${userMessage}
${repairContext ? `\nRelevant Technical Info:\n${repairContext}\n` : ''}
${containsDTCCode ? 'Provide a layered diagnostic explanation using this format: 1) What the component is, 2) What the code means, 3) Why it matters, 4) Likely causes, 5) Next steps.' : ''}
${repairTask ? 'Provide step-by-step repair instructions specific to this exact vehicle.' : 'Respond with mechanic-level accuracy and include only details specific to this vehicle.'}
`;
        }

        console.log("Enhanced user message with vehicle context:", 
          effectiveVehicleInfo ? "Yes" : "No (no vehicle context available)");
        console.log("Enhanced user message with repair data:", 
          repairContext ? "Yes" : "No");

        if (image) {
          console.log("Processing image-based query");
          const response = await identifyPart(image, enhancedUserMessage);
          handleSuccess();
          return { text: response, extra: { image } };
        } else {
          console.log("Processing text-based query");
          
          // Prepare message history plus the new user message
          const messages: ChatMessage[] = [
            ...previousMessages,
            { role: "user", content: enhancedUserMessage }
          ];
          
          const response = await chatWithAI(messages, true, effectiveVehicleInfo);
          handleSuccess();
          return { text: response };
        }
      } catch (error) {
        console.error("Error processing AI response:", error);
        return handleError(error);
      }
    },
    [chatWithAI, identifyPart, vehicleContext, handleSuccess, handleError]
  );

  /**
   * Extract potential repair task from user message
   */
  const extractRepairTask = (message: string): string | null => {
    // Common repair tasks and their related keywords
    const repairTasks = {
      "oil change": ["oil change", "oil filter", "drain plug", "oil pan", "engine oil"],
      "brake replacement": ["brake", "brake pad", "rotor", "caliper", "brake fluid"],
      "spark plug replacement": ["spark plug", "ignition", "misfire", "spark"],
      "battery replacement": ["battery", "charging", "alternator", "dead battery"],
      "tire rotation": ["tire", "rotation", "balance", "wheel", "tire pressure"],
      "air filter replacement": ["air filter", "cabin filter", "engine filter"],
      "timing belt replacement": ["timing belt", "timing chain", "belt", "chain"],
      "coolant flush": ["coolant", "radiator", "antifreeze", "overheating"],
      "transmission service": ["transmission", "fluid change", "gear", "shifting"],
      "suspension repair": ["suspension", "shock", "strut", "spring", "control arm"]
    };

    const messageLower = message.toLowerCase();
    
    for (const [task, keywords] of Object.entries(repairTasks)) {
      if (keywords.some(keyword => messageLower.includes(keyword))) {
        return task;
      }
    }
    
    return null;
  };

  /**
   * Extract OBD-II codes from a message
   */
  const extractDTCCodes = (message: string): string[] => {
    const dtcPattern = /\b[PBCU][0-9]{4}\b/gi;
    const matches = message.match(dtcPattern) || [];
    return [...new Set(matches.map(code => code.toUpperCase()))];
  };

  return {
    processAIResponse,
    currentVehicleContext,
  };
};
