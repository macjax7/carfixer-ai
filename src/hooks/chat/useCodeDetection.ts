
export const useCodeDetection = () => {
  /**
   * Checks if a message contains a standard OBD-II diagnostic trouble code (DTC)
   * Pattern matches P0xxx, P1xxx, B0xxx, C0xxx, U0xxx codes
   */
  const containsDTCCode = (message: string): boolean => {
    // Enhanced OBD-II code patterns
    const dtcPattern = /\b[PBCU][0-9][0-9][0-9][0-9]\b/i;
    return dtcPattern.test(message);
  };

  /**
   * Extracts all DTC codes from a message
   */
  const extractDTCCodes = (message: string): string[] => {
    const dtcPattern = /\b[PBCU][0-9][0-9][0-9][0-9]\b/gi;
    const matches = message.match(dtcPattern) || [];
    return [...new Set(matches.map(code => code.toUpperCase()))];
  };

  /**
   * Determines if the message contains common no-start symptoms
   */
  const containsNoStartSymptoms = (message: string): boolean => {
    const noStartTerms = [
      "won't start", "doesn't start", "no start", "not starting", 
      "won't crank", "won't turn over", "click but won't start"
    ];
    
    const messageLower = message.toLowerCase();
    return noStartTerms.some(term => messageLower.includes(term));
  };

  /**
   * Identifies engine performance symptoms
   */
  const containsPerformanceSymptoms = (message: string): boolean => {
    const performanceTerms = [
      "stall", "misfire", "rough idle", "hesitation", "surging",
      "lack of power", "poor acceleration", "check engine", "jerking",
      "rpm fluctuate", "rpm jumping", "poor performance"
    ];
    
    const messageLower = message.toLowerCase();
    return performanceTerms.some(term => messageLower.includes(term));
  };

  /**
   * Process message to determine what type of diagnostic content it contains
   */
  const processCodeType = (message: string): string | null => {
    const codes = extractDTCCodes(message);
    
    if (codes.length > 0) {
      return 'diagnostic';
    }
    
    if (containsNoStartSymptoms(message)) {
      return 'no-start';
    }
    
    if (containsPerformanceSymptoms(message)) {
      return 'performance';
    }
    
    return null;
  };

  return {
    containsDTCCode,
    extractDTCCodes,
    containsNoStartSymptoms,
    containsPerformanceSymptoms,
    processCodeType
  };
};
