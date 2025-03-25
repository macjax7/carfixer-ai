
/**
 * Utilities for DTC code detection in messages
 */

/**
 * Extract DTC (Diagnostic Trouble Codes) from a message
 */
export function extractDTCCodes(message: string): string[] {
  const dtcPattern = /\b[PBCU][0-9]{4}\b/gi;
  const matches = message.match(dtcPattern) || [];
  
  return [...new Set(matches.map(code => code.toUpperCase()))];
}
