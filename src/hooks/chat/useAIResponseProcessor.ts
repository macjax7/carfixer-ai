
import { useCallback, useState } from "react";
import { useOpenAI } from "@/utils/openai/hook";
import { useCodeDetection } from "./useCodeDetection";
import { useImageProcessor } from "./useImageProcessor";

export const useAIResponseProcessor = () => {
  const [currentVehicleContext, setCurrentVehicleContext] = useState<any>(null);
  const { chatWithAI, analyzeListing } = useOpenAI();
  const { processCodeType } = useCodeDetection();
  const { processImage } = useImageProcessor();

  /**
   * Process an AI response based on user input
   */
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
        console.log("Storing vehicle context:", vehicleInfo);
        setCurrentVehicleContext(vehicleInfo);
      }
      
      // Use stored vehicle context if available and no new context is provided
      const effectiveVehicleInfo = vehicleInfo || currentVehicleContext;
      console.log("Using effective vehicle context:", effectiveVehicleInfo);
      
      if (image) {
        // Process image-based query
        const result = await processImage(image, text, effectiveVehicleInfo);
        return result;
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
      
      // Extract component diagram if present in the AI response
      const extractComponentDiagram = (response: string) => {
        const diagramRegex = /{COMPONENT_DIAGRAM:\s*({.*?})}/s;
        const match = response.match(diagramRegex);
        
        if (match && match[1]) {
          try {
            const diagramData = JSON.parse(match[1]);
            return {
              componentName: diagramData.componentName || '',
              location: diagramData.location || '',
              diagramUrl: diagramData.diagramUrl || ''
            };
          } catch (error) {
            console.error('Error parsing component diagram data:', error);
            return null;
          }
        }
        return null;
      };
      
      // Check for component diagram in the response
      const componentDiagram = extractComponentDiagram(aiResponseText);
      if (componentDiagram) {
        console.log("Found component diagram in response:", componentDiagram);
        aiMessageExtra = { ...aiMessageExtra, componentDiagram };
      }
      
      return { text: aiResponseText, extra: aiMessageExtra };
    } catch (error) {
      console.error("Error processing AI response:", error);
      throw error;
    }
  }, [chatWithAI, analyzeListing, processCodeType, currentVehicleContext, processImage]);

  return { 
    processAIResponse,
    currentVehicleContext
  };
};
