
import { useCallback } from "react";
import { useOpenAI } from "@/utils/openai/hook";

export const useOBDProcessor = () => {
  const { getOBDAnalysis, extractOBDCodes } = useOpenAI();

  const processOBDCodes = useCallback(async (
    userMessage: string,
    vehicleInfo: any,
    handleSuccess: () => void
  ) => {
    // Extract OBD codes for specialized handling
    const obdCodes = extractOBDCodes(userMessage);
    
    // If OBD codes are detected, use the specialized OBD diagnostic flow
    if (obdCodes.length > 0 && vehicleInfo) {
      console.log("Processing OBD code analysis for codes:", obdCodes);
      
      // Extract potential symptoms from the message
      const symptoms = extractSymptomsFromText(userMessage);
      console.log("Extracted symptoms:", symptoms);
      
      // Get detailed OBD analysis from specialized endpoint
      const analysis = await getOBDAnalysis(obdCodes, symptoms);
      
      // Mark the request as successful
      handleSuccess();
      
      return { text: analysis, extra: { obdCodes } };
    }
    
    return null;
  }, [extractOBDCodes, getOBDAnalysis]);

  /**
   * Extract symptoms from text to provide better context for OBD analysis
   */
  const extractSymptomsFromText = (text: string): string[] => {
    const commonSymptoms = [
      "check engine light", "won't start", "stalling", "rough idle", 
      "hesitation", "misfire", "overheating", "noise", "knocking", 
      "vibration", "smoke", "poor acceleration", "poor fuel economy", 
      "leak", "grinding", "squealing"
    ];
    
    const lowerText = text.toLowerCase();
    return commonSymptoms.filter(symptom => lowerText.includes(symptom));
  };

  return { processOBDCodes };
};
