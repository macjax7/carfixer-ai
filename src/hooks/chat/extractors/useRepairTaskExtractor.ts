
import { useCallback } from "react";

export const useRepairTaskExtractor = () => {
  /**
   * Extract potential repair task from user message
   */
  const extractRepairTask = useCallback((message: string): string | null => {
    // Common repair tasks and their related keywords
    const repairTasks = {
      "oil change": ["oil change", "oil filter", "drain plug", "oil pan", "engine oil"],
      "brake replacement": ["brake", "brake pad", "rotor", "caliper", "brake fluid"],
      "spark plug replacement": ["spark plug", "ignition", "misfire", "spark"],
      "battery replacement": ["battery", "charging", "alternator", "dead battery"],
      "tire rotation": ["tire", "rotation", "balance", "wheel", "tire pressure"],
      "air filter replacement": ["air filter", "cabin filter", "engine filter"],
      "timing belt replacement": ["timing belt", "timing chain", "belt", "chain"],
      "coolant flush": ["coolant", "radiator", "antifreeze", "overheating"],
      "transmission service": ["transmission", "fluid change", "gear", "shifting"],
      "suspension repair": ["suspension", "shock", "strut", "spring", "control arm"]
    };

    const messageLower = message.toLowerCase();
    
    for (const [task, keywords] of Object.entries(repairTasks)) {
      if (keywords.some(keyword => messageLower.includes(keyword))) {
        return task;
      }
    }
    
    return null;
  }, []);

  return { extractRepairTask };
};
