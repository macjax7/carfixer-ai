
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
import { useSystemPrompt } from '@/hooks/chat/useSystemPrompt';
import { getOBDDiagnostics, extractOBDCodes } from './obd';
import { fetchRepairData } from './repair-data';

/**
 * Custom hook to use the CarFix API with vehicle context
 */
export function useOpenAI() {
  const { selectedVehicle } = useVehicles();
  const { processCodeType } = useCodeDetection();
  const { systemPrompt } = useSystemPrompt();
  
  const chatWithAI = async (
    messages: ChatMessage[], 
    includeVehicleContext = true,
    vehicleOverride = null,
    messageHistory: string[] = []
  ) => {
    try {
      console.log("Starting chatWithAI with messages:", messages);
      console.log("Vehicle context:", vehicleOverride || selectedVehicle);
      console.log("Using system prompt:", systemPrompt);
      
      // Extract OBD codes from the last user message
      const lastUserMessage = messages.filter(m => m.role === 'user').pop();
      const obdCodes = lastUserMessage ? extractOBDCodes(lastUserMessage.content) : [];
      
      // If OBD codes are detected, use the specialized OBD diagnostic flow
      if (obdCodes.length > 0 && (vehicleOverride || selectedVehicle)) {
        console.log("OBD codes detected, using specialized diagnostic flow:", obdCodes);
        try {
          // Get detailed OBD analysis from specialized endpoint
          const analysis = await getOBDDiagnostics({
            codes: obdCodes,
            vehicleInfo: vehicleOverride || selectedVehicle,
            symptoms: [] // Could extract symptoms from message in the future
          });
          return analysis;
        } catch (error) {
          console.error("Error in OBD analysis, falling back to standard chat:", error);
          // Fall back to regular chat if OBD analysis fails
        }
      }
      
      const response = await sendChatMessage(
        messages, 
        includeVehicleContext, 
        vehicleOverride || selectedVehicle,
        messageHistory,
        systemPrompt
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
  
  const getOBDAnalysis = async (codes: string[], symptoms: string[] = []) => {
    return getOBDDiagnostics({
      codes,
      vehicleInfo: selectedVehicle,
      symptoms
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
  
  const getRepairInfo = async (vehicleInfo: any, task?: string) => {
    return fetchRepairData(vehicleInfo, task);
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
    getOBDAnalysis,
    findParts,
    getRepairSteps,
    getRepairInfo,
    decodeVehicleVIN,
    getOBDData,
    speechToText: convertSpeechToText,
    processCodeType,
    extractOBDCodes
  };
}
