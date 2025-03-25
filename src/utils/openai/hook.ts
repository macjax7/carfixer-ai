import { useVehicles } from '@/hooks/use-vehicles';
import { sendChatMessage } from './chat';
import { analyzeImage } from './image';
import { analyzeVehicleListing } from './listing';
import { getDiagnosticInfo } from './diagnostic';
import { lookupPart } from './parts';
import { getRepairGuidance } from './repair';
import { decodeVIN, getOBDSensorData } from './vehicle';
import { speechToText } from './speech';
import { ChatMessage } from './types';
import { useCodeDetection } from '@/hooks/chat/useCodeDetection';

/**
 * Custom hook to use the CarFix API with vehicle context
 */
export function useOpenAI() {
  const { selectedVehicle } = useVehicles();
  const { processCodeType } = useCodeDetection();
  
  const chatWithAI = async (
    messages: ChatMessage[], 
    includeVehicleContext = true,
    vehicleOverride = null,
    messageHistory: string[] = []
  ) => {
    try {
      console.log("Starting chatWithAI with messages:", messages);
      console.log("Vehicle context:", vehicleOverride || selectedVehicle);
      
      const response = await sendChatMessage(
        messages, 
        includeVehicleContext, 
        vehicleOverride || selectedVehicle,
        messageHistory
      );
      console.log("Chat response:", response);
      return response;
    } catch (error) {
      console.error("Error in chatWithAI:", error);
      throw error;
    }
  };
  
  const identifyPart = async (imageUrl: string, customPrompt?: string, vehicleInfo?: any) => {
    try {
      // Use vehicleInfo if provided, otherwise fall back to selectedVehicle
      const effectiveVehicle = vehicleInfo || selectedVehicle;
      
      console.log("identifyPart called with:", {
        imageUrlLength: imageUrl?.length || 0,
        hasCustomPrompt: !!customPrompt,
        effectiveVehicle
      });
      
      const prompt = customPrompt || `Identify this car part and explain its purpose. ${
        effectiveVehicle ? `This is from a ${effectiveVehicle.year} ${effectiveVehicle.make} ${effectiveVehicle.model}.` : ''
      }`;
      
      console.log("Identifying part with prompt:", prompt);
      console.log("Vehicle context:", effectiveVehicle || "No vehicle context");
      
      // Add a timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Image analysis timed out after 30 seconds")), 30000)
      );
      
      const analysisPromise = analyzeImage(imageUrl, prompt, effectiveVehicle);
      const result = await Promise.race([analysisPromise, timeoutPromise]);
      
      console.log("Image analysis completed successfully");
      return result;
    } catch (error) {
      console.error("Error in identifyPart:", error);
      throw error;
    }
  };
  
  const analyzeListing = async (url: string) => {
    return analyzeVehicleListing(url);
  };
  
  const getDiagnostics = async (params: {
    dtcCode?: string;
    symptoms?: string[];
    noStart?: boolean;
  }) => {
    return getDiagnosticInfo({
      ...params,
      vehicleInfo: selectedVehicle
    });
  };
  
  const findParts = async (params: {
    partName: string;
    partNumber?: string;
    oem?: boolean;
    aftermarket?: boolean;
  }) => {
    return lookupPart({
      ...params,
      vehicleInfo: selectedVehicle
    });
  };
  
  const getRepairSteps = async (params: {
    repairType: string;
    partName?: string;
    dtcCode?: string;
  }) => {
    return getRepairGuidance({
      ...params,
      vehicleInfo: selectedVehicle
    });
  };
  
  const decodeVehicleVIN = async (vin: string) => {
    return decodeVIN(vin);
  };
  
  const getOBDData = async () => {
    return getOBDSensorData();
  };
  
  const convertSpeechToText = async (audioBlob: Blob) => {
    return speechToText(audioBlob);
  };
  
  return {
    chatWithAI,
    identifyPart,
    analyzeListing,
    getDiagnostics,
    findParts,
    getRepairSteps,
    decodeVehicleVIN,
    getOBDData,
    speechToText: convertSpeechToText,
    processCodeType
  };
}
