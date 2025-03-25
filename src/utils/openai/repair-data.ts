
import { supabase } from '@/integrations/supabase/client';

// Types for repair data
export interface RepairData {
  procedure?: string;
  torqueSpecs?: Record<string, string>;
  fluidTypes?: Record<string, string>;
  partNumbers?: Record<string, string>;
  toolsRequired?: string[];
  safetyNotes?: string[];
  estimatedTime?: string;
}

/**
 * Fetch repair data for a specific vehicle and task
 */
export async function fetchRepairData(vehicleInfo: any, task?: string): Promise<string> {
  if (!vehicleInfo || !vehicleInfo.make || !vehicleInfo.model || !vehicleInfo.year) {
    console.log("Insufficient vehicle info to fetch repair data");
    return "";
  }

  try {
    console.log(`Fetching repair data for ${vehicleInfo.year} ${vehicleInfo.make} ${vehicleInfo.model}, task: ${task || 'general'}`);
    
    const { data, error } = await supabase.functions.invoke('openai', {
      body: {
        service: 'repair',
        action: 'getData',
        data: {
          vehicleInfo,
          task
        }
      }
    });

    if (error) {
      console.error("Error fetching repair data:", error);
      return "";
    }

    if (!data || !data.repairData) {
      console.log("No repair data returned");
      return "";
    }

    return formatRepairData(data.repairData);
  } catch (error) {
    console.error("Error in fetchRepairData:", error);
    return "";
  }
}

/**
 * Format repair data into a string format for the prompt
 */
function formatRepairData(data: RepairData): string {
  if (!data || Object.keys(data).length === 0) {
    return "";
  }

  let formattedData = "";

  if (data.procedure) {
    formattedData += `PROCEDURE: ${data.procedure}\n\n`;
  }

  if (data.torqueSpecs && Object.keys(data.torqueSpecs).length > 0) {
    formattedData += "TORQUE SPECIFICATIONS:\n";
    for (const [part, spec] of Object.entries(data.torqueSpecs)) {
      formattedData += `- ${part}: ${spec}\n`;
    }
    formattedData += "\n";
  }

  if (data.fluidTypes && Object.keys(data.fluidTypes).length > 0) {
    formattedData += "RECOMMENDED FLUIDS:\n";
    for (const [type, recommendation] of Object.entries(data.fluidTypes)) {
      formattedData += `- ${type}: ${recommendation}\n`;
    }
    formattedData += "\n";
  }

  if (data.partNumbers && Object.keys(data.partNumbers).length > 0) {
    formattedData += "COMMON PART NUMBERS:\n";
    for (const [part, number] of Object.entries(data.partNumbers)) {
      formattedData += `- ${part}: ${number}\n`;
    }
    formattedData += "\n";
  }

  if (data.toolsRequired && data.toolsRequired.length > 0) {
    formattedData += "TOOLS REQUIRED:\n";
    for (const tool of data.toolsRequired) {
      formattedData += `- ${tool}\n`;
    }
    formattedData += "\n";
  }

  if (data.safetyNotes && data.safetyNotes.length > 0) {
    formattedData += "SAFETY NOTES:\n";
    for (const note of data.safetyNotes) {
      formattedData += `- ${note}\n`;
    }
    formattedData += "\n";
  }

  if (data.estimatedTime) {
    formattedData += `ESTIMATED TIME: ${data.estimatedTime}\n`;
  }

  return formattedData;
}
