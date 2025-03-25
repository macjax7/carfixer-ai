
import { extractOBDCodes } from '@/utils/openai/obd';

export const useCodeDetection = () => {
  /**
   * Check if a message contains OBD-II DTC codes
   */
  const containsDTCCode = (message: string): boolean => {
    return extractOBDCodes(message).length > 0;
  };

  /**
   * Determine the type of code present in a message
   */
  const processCodeType = (message: string): string | null => {
    if (containsDTCCode(message)) {
      return 'diagnostic';
    }
    
    // Additional code types could be added here in the future
    // For example: VIN numbers, part numbers, etc.
    
    return null;
  };

  /**
   * Extract DTCs and return them with metadata
   */
  const extractCodes = (message: string): { 
    codes: string[]; 
    hasHighSeverity: boolean;
  } => {
    const codes = extractOBDCodes(message);
    
    // Check if any high severity codes are present
    const hasHighSeverity = codes.some(code => {
      // Quick check for misfire codes (P0300-P0308)
      if (/P030[0-8]/.test(code)) return true;
      
      // Check for other critical codes like:
      // - P0340-P0344 (Camshaft position sensor)
      // - P0335-P0339 (Crankshaft position sensor)
      // - Various transmission codes starting with P07xx
      if (/P03[345]\d/.test(code) || code.startsWith('P07')) return true;
      
      return false;
    });
    
    return { codes, hasHighSeverity };
  };

  return {
    containsDTCCode,
    processCodeType,
    extractCodes
  };
};
