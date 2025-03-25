
import { useCallback, useState } from "react";
import { useOpenAI } from "@/utils/openai/hook";
import { useVehicleContext } from "./useVehicleContext";

export const useAIResponseProcessor = () => {
  const { chatWithAI, identifyPart } = useOpenAI();
  const [currentVehicleContext, setCurrentVehicleContext] = useState<any>(null);
  const { vehicleContext } = useVehicleContext();

  const processAIResponse = useCallback(
    async (
      userMessage: string,
      image?: string,
      vehicleInfo = null
    ): Promise<{ text: string; extra?: any }> => {
      try {
        const effectiveVehicleInfo = vehicleInfo || vehicleContext;
        setCurrentVehicleContext(effectiveVehicleInfo);

        // Create the enhanced prompt with vehicle context
        let enhancedUserMessage = userMessage;
        if (effectiveVehicleInfo) {
          enhancedUserMessage = `
Vehicle: ${effectiveVehicleInfo.year} ${effectiveVehicleInfo.make} ${effectiveVehicleInfo.model}

User Question: ${userMessage}

Respond with mechanic-level accuracy and include only details specific to this vehicle.
`;
        }

        console.log("Enhanced user message with vehicle context:", 
          effectiveVehicleInfo ? "Yes" : "No (no vehicle context available)");

        if (image) {
          console.log("Processing image-based query");
          const response = await identifyPart(image, enhancedUserMessage);
          return { text: response, extra: { image } };
        } else {
          console.log("Processing text-based query");
          const messages = [
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

  return {
    processAIResponse,
    currentVehicleContext,
  };
};
