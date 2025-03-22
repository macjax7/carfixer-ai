
/**
 * Helper functions for detecting OBD-II codes in messages
 */
export const useCodeDetection = () => {
  // Pattern for OBD-II codes: P, B, C, or U followed by 4 digits
  const containsDTCCode = (message: string): boolean => {
    const dtcPattern = /\b[PBCU][0-9]{4}\b/i;
    return dtcPattern.test(message);
  };
  
  return {
    containsDTCCode
  };
};
