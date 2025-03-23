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
  
  const identifyPart = async (imageUrl: string, customPrompt?: string) => {
    const prompt = customPrompt || `Identify this car part and explain its purpose. ${
      selectedVehicle ? `This is from a ${selectedVehicle.year} ${selectedVehicle.make} ${selectedVehicle.model}.` : ''
    }`;
    
    return analyzeImage(imageUrl, prompt, selectedVehicle);
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
