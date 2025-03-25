
import { supabase } from '@/integrations/supabase/client';

/**
 * Request a diagnostic analysis for OBD-II codes
 */
export async function getOBDDiagnostics(params: { 
  codes: string[]; 
  vehicleInfo: any;
  symptoms?: string[];
}) {
  try {
    const { data, error } = await supabase.functions.invoke('openai', {
      body: {
        service: 'diagnostic',
        action: 'obd',
        data: params
      }
    });

    if (error) throw new Error(error.message);
    return data.analysis;
  } catch (error) {
    console.error('Error getting OBD diagnostics:', error);
    throw error;
  }
}

/**
 * Extract OBD-II codes from text
 */
export function extractOBDCodes(text: string): string[] {
  // Regular expression for standard OBD-II codes
  // P = Powertrain, B = Body, C = Chassis, U = Network
  const codeRegex = /\b[PBCU][0-9]{4}\b/gi;
  const matches = text.match(codeRegex) || [];
  
  return [...new Set(matches.map(code => code.toUpperCase()))];
}

/**
 * Check if text contains OBD code references
 */
export function containsOBDCodes(text: string): boolean {
  return extractOBDCodes(text).length > 0;
}

/**
 * Get basic info about an OBD code
 */
export function getCodeCategory(code: string): { system: string; description: string } {
  const prefix = code[0].toUpperCase();
  let system = '';
  let description = '';
  
  switch (prefix) {
    case 'P':
      system = 'Powertrain';
      description = 'Engine, transmission, and emissions systems';
      break;
    case 'B':
      system = 'Body';
      description = 'Air conditioning, airbags, lighting';
      break;
    case 'C':
      system = 'Chassis';
      description = 'ABS, suspension, steering';
      break;
    case 'U':
      system = 'Network';
      description = 'Wiring buses and computer communication';
      break;
    default:
      system = 'Unknown';
      description = 'Not a standard OBD-II code';
  }
  
  return { system, description };
}
