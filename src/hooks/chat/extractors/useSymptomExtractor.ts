
import { useCallback } from "react";

export const useSymptomExtractor = () => {
  /**
   * Extract symptoms from user message
   */
  const extractSymptoms = useCallback((message: string): string[] => {
    const commonSymptoms = [
      "check engine light", "cel", "mil", "warning light",
      "won't start", "no start", "hard start", "difficult to start",
      "stalling", "dies", "cuts off",
      "rough idle", "hunting idle", "surging",
      "hesitation", "stumble", "bucking", "jerking",
      "misfire", "miss", "stumble", "backfire",
      "overheating", "running hot", "temperature",
      "noise", "knocking", "ticking", "rattle", "clunk",
      "vibration", "shaking", "wobble",
      "smoke", "burning smell", "oil smell", "gas smell",
      "poor acceleration", "lack of power", "sluggish",
      "poor fuel economy", "bad gas mileage",
      "leaking", "leak", "dripping",
      "grinding", "squealing", "squeaking"
    ];
    
    const messageLower = message.toLowerCase();
    const foundSymptoms: string[] = [];
    
    // Check for common symptoms
    for (const symptom of commonSymptoms) {
      if (messageLower.includes(symptom)) {
        foundSymptoms.push(symptom);
      }
    }
    
    // Deduplicate and return
    return [...new Set(foundSymptoms)];
  }, []);

  return { extractSymptoms };
};
