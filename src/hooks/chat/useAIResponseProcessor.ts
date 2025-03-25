
import { useCallback, useState } from "react";
import { useOpenAI } from "@/utils/openai/hook";
import { useVehicleContext } from "./useVehicleContext";
import { ChatMessage } from "@/utils/openai/types";
import { fetchRepairData } from "@/utils/openai/repair-data";

export const useAIResponseProcessor = () => {
  const { chatWithAI, identifyPart } = useOpenAI();
  const [currentVehicleContext, setCurrentVehicleContext] = useState<any>(null);
  const { vehicleContext } = useVehicleContext();

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
        
        // Fetch repair data if we have vehicle info and a potential repair task
        let repairContext = "";
        if (effectiveVehicleInfo && repairTask) {
          console.log("Fetching repair data for task:", repairTask);
          repairContext = await fetchRepairData(effectiveVehicleInfo, repairTask);
          console.log("Received repair context data:", repairContext ? "Yes" : "No");
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

        if (image) {
          console.log("Processing image-based query");
          const response = await identifyPart(image, enhancedUserMessage);
          return { text: response, extra: { image } };
        } else {
          console.log("Processing text-based query");
          
          // Prepare message history plus the new user message
          const messages: ChatMessage[] = [
            ...previousMessages,
            { role: "user", content: enhancedUserMessage }
          ];
          
          const response = await chatWithAI(messages, true, effectiveVehicleInfo);
          return { text: response };
        }
      } catch (error) {
        console.error("Error processing AI response:", error);
        throw error;
      }
    },
    [chatWithAI, identifyPart, vehicleContext]
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

  return {
    processAIResponse,
    currentVehicleContext,
  };
};
