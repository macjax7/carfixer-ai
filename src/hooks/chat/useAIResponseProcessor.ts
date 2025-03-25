
import { useCallback, useState } from "react";
import { useOpenAI } from "@/utils/openai/hook";
import { useVehicleContext } from "./useVehicleContext";
import { ChatMessage } from "@/utils/openai/types";
import { fetchRepairData } from "@/utils/openai/repair-data";

export const useAIResponseProcessor = () => {
  const { chatWithAI, identifyPart, extractOBDCodes, getOBDAnalysis } = useOpenAI();
  const [currentVehicleContext, setCurrentVehicleContext] = useState<any>(null);
  const { vehicleContext } = useVehicleContext();
  const [consecutiveErrorCount, setConsecutiveErrorCount] = useState(0);

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

        // Handle specialized OBD code analysis if we have codes and vehicle info
        if (obdCodes.length > 0 && effectiveVehicleInfo) {
          console.log("Processing OBD code analysis for codes:", obdCodes);
          try {
            const analysis = await getOBDAnalysis(obdCodes, symptoms);
            // Reset error count on successful response
            setConsecutiveErrorCount(0);
            return { text: analysis, extra: { obdCodes } };
          } catch (error) {
            console.error("Error in OBD analysis, falling back to standard chat:", error);
            // Continue with standard processing if OBD analysis fails
          }
        }

        let response;
        try {
          if (image) {
            console.log("Processing image-based query");
            response = await identifyPart(image, enhancedUserMessage);
          } else {
            console.log("Processing text-based query");
            
            // Prepare message history plus the new user message
            const messages: ChatMessage[] = [
              ...previousMessages,
              { role: "user", content: enhancedUserMessage }
            ];
            
            response = await chatWithAI(messages, true, effectiveVehicleInfo);
          }
          
          // Reset error count on successful response
          setConsecutiveErrorCount(0);
          return { 
            text: response, 
            extra: { 
              obdCodes: obdCodes.length > 0 ? obdCodes : undefined,
              image: image ? image : undefined 
            } 
          };
        } catch (error) {
          console.error("Error in AI processing, using fallback:", error);
          
          // Increment error counter
          setConsecutiveErrorCount(prev => prev + 1);
          
          // Create a fallback response depending on number of consecutive errors
          let fallbackMessage;
          if (consecutiveErrorCount >= 2) {
            fallbackMessage = "I'm experiencing persistent connectivity issues. Please check your internet connection and try again later. If the problem continues, it may be a temporary service outage.";
          } else {
            fallbackMessage = "I apologize, but I'm having trouble connecting to my knowledge database. Please try your question again in a moment.";
          }
          
          return { text: fallbackMessage, extra: {} };
        }
      } catch (error) {
        console.error("Error processing AI response:", error);
        throw error;
      }
    },
    [
      chatWithAI, 
      identifyPart, 
      vehicleContext, 
      extractOBDCodes, 
      getOBDAnalysis, 
      consecutiveErrorCount
    ]
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
   * Extract symptoms from user message
   */
  const extractSymptoms = (message: string): string[] => {
    const commonSymptoms = [
      "check engine light", "cel", "mil", "warning light",
      "won't start", "no start", "hard start", "difficult to start",
      "stalling", "dies", "cuts off",
      "rough idle", "hunting idle", "surging",
      "hesitation", "stumble", "bucking", "jerking",
      "misfire", "miss", "stumble", "backfire",
      "overheating", "running hot", "temperature",
      "noise", "knocking", "ticking", "rattle", "clunk",
      "vibration", "shaking", "wobble",
      "smoke", "burning smell", "oil smell", "gas smell",
      "poor acceleration", "lack of power", "sluggish",
      "poor fuel economy", "bad gas mileage",
      "leaking", "leak", "dripping",
      "grinding", "squealing", "squeaking"
    ];
    
    const messageLower = message.toLowerCase();
    const foundSymptoms: string[] = [];
    
    // Check for common symptoms
    for (const symptom of commonSymptoms) {
      if (messageLower.includes(symptom)) {
        foundSymptoms.push(symptom);
      }
    }
    
    // Deduplicate and return
    return [...new Set(foundSymptoms)];
  };

  return {
    processAIResponse,
    currentVehicleContext,
  };
};
