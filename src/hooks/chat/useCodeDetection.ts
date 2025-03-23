
export const useCodeDetection = () => {
  const containsDTCCode = (message: string): boolean => {
    // Common OBD-II code patterns
    const dtcPattern = /[PB][0-9][0-9][0-9][0-9]/i;
    return dtcPattern.test(message);
  };

  const processCodeType = (message: string): string | null => {
    if (containsDTCCode(message)) {
      return 'diagnostic';
    }
    return null;
  };

  return {
    containsDTCCode,
    processCodeType
  };
};
