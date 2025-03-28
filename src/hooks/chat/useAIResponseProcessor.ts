
import { useCallback, useState } from "react";
import { useOpenAI } from "@/utils/openai/hook";
import { useCodeDetection } from "./useCodeDetection";
import { useImageProcessor } from "./useImageProcessor";

export const useAIResponseProcessor = () => {
  const [currentVehicleContext, setCurrentVehicleContext] = useState<any>(null);
  const { chatWithAI, analyzeListing, getRepairSteps } = useOpenAI();
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
      console.log("processAIResponse called with:", { 
        textLength: text.length, 
        hasImage: !!image,
        imageLength: image?.length || 0,
        vehicleInfo 
      });
      
      // Store vehicle context when it's provided
      if (vehicleInfo && Object.keys(vehicleInfo).length > 0) {
        console.log("Storing vehicle context:", vehicleInfo);
        setCurrentVehicleContext(vehicleInfo);
      }
      
      // Use stored vehicle context if available and no new context is provided
      const effectiveVehicleInfo = vehicleInfo || currentVehicleContext;
      console.log("Using effective vehicle context:", effectiveVehicleInfo);
      
      if (image) {
        // Process image-based query - explicitly log that we're entering the image processing path
        console.log("IMAGE PATH: Processing image with text prompt:", text);
        
        try {
          const result = await processImage(image, text, effectiveVehicleInfo);
          console.log("Image processing completed successfully:", { 
            resultTextLength: result.text?.length || 0,
            hasExtra: Object.keys(result.extra || {}).length > 0
          });
          return result;
        } catch (error) {
          console.error("Error in image processing path:", error);
          
          // Return a descriptive error message to the user
          return {
            text: `I'm sorry, I couldn't analyze that image. Error: ${error.message || 'Unknown error'}. Please try again with a clearer image.`,
            extra: { error: true }
          };
        }
      } else if (/https?:\/\/[^\s]+/.test(text)) {
        // Process URL-based query
        console.log("Processing URL-based query with vehicle info:", effectiveVehicleInfo);
        const urlResults = await analyzeListing(text);
        if (urlResults.vehicleListingAnalysis) {
          aiResponseText = urlResults.text;
          aiMessageExtra = { vehicleListingAnalysis: urlResults.vehicleListingAnalysis };
          console.log("URL processing result: Vehicle listing analysis");
        } else {
          // If it's not a vehicle listing, just process as a normal query
          console.log("URL doesn't appear to be a vehicle listing, processing as normal text");
          aiResponseText = await chatWithAI([{ role: 'user', content: text }], true, effectiveVehicleInfo);
        }
      } else if (/how to (fix|repair|replace|install|remove|change)/.test(text.toLowerCase())) {
        // Process repair guide requests
        console.log("Detected repair guide request, generating structured guide");
        
        // Extract repair type from the query
        const repairMatch = text.toLowerCase().match(/how to (fix|repair|replace|install|remove|change) ([^?.,]+)/);
        if (repairMatch && repairMatch[2]) {
          const repairType = `${repairMatch[1]} ${repairMatch[2]}`.trim();
          console.log("Detected repair type:", repairType);
          
          // Extract part name if present
          const partMatch = repairMatch[2].match(/(?:the|a|an) (.+)/);
          const partName = partMatch ? partMatch[1].trim() : repairMatch[2].trim();
          
          // Look for diagnostic code in the query
          const dtcMatch = text.match(/[PB][0-9]{4}/i);
          const dtcCode = dtcMatch ? dtcMatch[0].toUpperCase() : undefined;
          
          // Generate structured repair guide
          const repairGuide = await getRepairSteps({
            repairType,
            partName,
            dtcCode,
          });
          
          aiResponseText = repairGuide;
          aiMessageExtra = { 
            repairGuidance: {
              content: repairGuide,
              format: 'structured'
            }
          };
          console.log("Generated structured repair guide");
        } else {
          // If we can't extract a specific repair type, fall back to normal chat
          console.log("Could not extract repair type, falling back to normal chat");
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
          // Check if this is a component location query
          const locationKeywords = [
            'where is', 'where are', 'location of', 'find the', 'where can i find', 
            'how do i access', 'how to access', 'how to find', 'where to find'
          ];
          
          const isLocationQuery = locationKeywords.some(keyword => 
            text.toLowerCase().includes(keyword)
          );
          
          if (isLocationQuery) {
            console.log("Detected potential component location query");
            // For location queries, explicitly use GPT-4o
            aiResponseText = await chatWithAI([{ 
              role: 'user', 
              content: `${text} Please respond with a detailed location description and include a component diagram using the COMPONENT_DIAGRAM format.`
            }], true, effectiveVehicleInfo);
          } else {
            // Process normal text query
            console.log("No specialized query detected, processing as normal text with vehicle context");
            aiResponseText = await chatWithAI([{ role: 'user', content: text }], true, effectiveVehicleInfo);
          }
        }
      }
      
      console.log("AI response received, length:", aiResponseText?.length || 0);
      
      // Extract component diagram if present in the AI response
      const extractComponentDiagram = (response: string) => {
        const diagramRegex = /{COMPONENT_DIAGRAM:\s*({.*?})}/s;
        const match = response.match(diagramRegex);
        
        if (match && match[1]) {
          try {
            const diagramData = JSON.parse(match[1]);
            console.log("Extracted component diagram from AI response:", diagramData);
            return {
              componentName: diagramData.componentName || '',
              location: diagramData.location || '',
              diagramUrl: diagramData.diagramUrl || '',
              highlightedDiagramUrl: diagramData.highlightedDiagramUrl || '' // Get highlighted diagram URL
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
      return {
        text: `I'm sorry, I encountered an error processing your request. Error: ${error.message || 'Unknown error'}. Please try again.`,
        extra: { error: true }
      };
    }
  }, [chatWithAI, analyzeListing, processCodeType, currentVehicleContext, processImage, getRepairSteps]);

  return { 
    processAIResponse,
    currentVehicleContext
  };
};
