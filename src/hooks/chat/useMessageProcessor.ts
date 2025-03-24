
import { useState, useCallback } from "react";
import { nanoid } from "nanoid";
import { Message } from "@/components/chat/types";
import { useOpenAI } from "@/utils/openai/hook";
import { useCodeDetection } from "./useCodeDetection";

export const useMessageProcessor = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentVehicleContext, setCurrentVehicleContext] = useState<any>(null);
  const { chatWithAI, analyzeListing, identifyPart } = useOpenAI();
  const { processCodeType } = useCodeDetection();

  const processUserMessage = useCallback((text: string, image?: string): Message => {
    return {
      id: nanoid(),
      sender: 'user' as const,
      text,
      timestamp: new Date(),
      image
    };
  }, []);

  const processAIResponse = useCallback(async (
    text: string,
    image?: string,
    vehicleInfo?: any
  ): Promise<{text: string, extra: Record<string, any>}> => {
    let aiResponseText = '';
    let aiMessageExtra = {};
    
    try {
      // Store vehicle context when it's provided
      if (vehicleInfo && Object.keys(vehicleInfo).length > 0) {
        setCurrentVehicleContext(vehicleInfo);
      }
      
      // Use stored vehicle context if available and no new context is provided
      const effectiveVehicleInfo = vehicleInfo || currentVehicleContext;
      
      if (image) {
        // Process image-based query
        console.log("Processing image-based query with vehicle info:", effectiveVehicleInfo);
        const imageResult = await identifyPart(image, text);
        aiResponseText = imageResult.text;
        if (imageResult.componentDiagram) {
          aiMessageExtra = { componentDiagram: imageResult.componentDiagram };
        }
      } else if (/https?:\/\/[^\s]+/.test(text)) {
        // Process URL-based query
        console.log("Processing URL-based query with vehicle info:", effectiveVehicleInfo);
        const urlResults = await analyzeListing(text);
        if (urlResults.vehicleListingAnalysis) {
          aiResponseText = urlResults.text;
          aiMessageExtra = { vehicleListingAnalysis: urlResults.vehicleListingAnalysis };
        } else {
          // If it's not a vehicle listing, just process as a normal query
          console.log("URL doesn't appear to be a vehicle listing, processing as normal text");
          aiResponseText = await chatWithAI([{ role: 'user', content: text }], true, effectiveVehicleInfo);
        }
      } else {
        // Process code detection for diagnostic codes
        console.log("Processing text query with vehicle info:", effectiveVehicleInfo);
        const codeType = processCodeType(text);
        if (codeType) {
          console.log("Detected code type:", codeType);
          aiResponseText = await chatWithAI([{ role: 'user', content: text }], true, effectiveVehicleInfo, [codeType]);
        } else {
          // Process normal text query
          console.log("No code detected, processing as normal text with vehicle context:", effectiveVehicleInfo);
          aiResponseText = await chatWithAI([{ role: 'user', content: text }], true, effectiveVehicleInfo);
        }
      }
      
      return { text: aiResponseText, extra: aiMessageExtra };
    } catch (error) {
      console.error("Error processing AI response:", error);
      throw error;
    }
  }, [chatWithAI, identifyPart, analyzeListing, processCodeType, currentVehicleContext]);

  const createAIMessage = useCallback((
    text: string, 
    extraData: Record<string, any> = {}
  ): Message => {
    return {
      id: nanoid(),
      sender: 'ai' as const,
      text,
      timestamp: new Date(),
      ...extraData
    };
  }, []);

  return {
    isProcessing,
    setIsProcessing,
    processUserMessage,
    processAIResponse,
    createAIMessage,
    currentVehicleContext
  };
};
