
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

/**
 * Get more detailed info about a P-code (Powertrain)
 */
export function getPCodeInfo(code: string): { 
  category: string; 
  subcategory: string;
  manufacturer: boolean;
} {
  // Ensure it's a P-code
  if (!code.startsWith('P')) {
    return {
      category: 'Unknown',
      subcategory: 'Not a powertrain code',
      manufacturer: false
    };
  }
  
  const digit1 = parseInt(code[1], 10);
  const digit2 = parseInt(code[2], 10);
  const isManufacturerSpecific = digit1 === 1 || digit1 === 3;
  
  let category = '';
  
  // First digit indicates if it's a generic or manufacturer-specific code
  if (digit1 === 0) category = 'Generic';
  else if (digit1 === 1) category = 'Manufacturer Specific';
  else if (digit1 === 2) category = 'Generic (extended)';
  else if (digit1 === 3) category = 'Manufacturer Specific (extended)';
  
  // Second digit indicates the subsystem
  let subcategory = '';
  
  switch (digit2) {
    case 0:
      subcategory = 'Fuel and Air Metering';
      break;
    case 1:
      subcategory = 'Fuel and Air Metering';
      break;
    case 2:
      subcategory = 'Fuel and Air Metering';
      break;
    case 3:
      subcategory = 'Ignition System';
      break;
    case 4:
      subcategory = 'Auxiliary Emissions Controls';
      break;
    case 5:
      subcategory = 'Vehicle Speed Control and Idle Control';
      break;
    case 6:
      subcategory = 'Computer Output Circuit';
      break;
    case 7:
      subcategory = 'Transmission';
      break;
    case 8:
      subcategory = 'Transmission';
      break;
    case 9:
      subcategory = 'Reserved for SAE';
      break;
    default:
      subcategory = 'Unknown';
  }
  
  return {
    category,
    subcategory,
    manufacturer: isManufacturerSpecific
  };
}

/**
 * Provides severity estimates for common OBD codes
 */
export function estimateCodeSeverity(code: string): 'low' | 'medium' | 'high' {
  // Common critical codes that should be addressed immediately
  const highSeverityCodes = [
    'P0171', 'P0174',  // Extremely lean conditions - can damage catalytic converter
    'P0300', 'P0301', 'P0302', 'P0303', 'P0304', 'P0305', 'P0306', 'P0307', 'P0308',  // Misfires
    'P0336', 'P0337', 'P0338', 'P0339',  // Crankshaft position sensor issues - can cause no-start
    'P0340', 'P0341', 'P0342', 'P0343',  // Camshaft position sensor issues - can cause no-start
    'P0440', 'P0442', 'P0455',  // EVAP system issues - environmental concern
    'P0506', 'P0507',  // Idle control issues
    'P0700', 'P0706', 'P0707', 'P0708',  // Transmission issues
    'C0035', 'C0036', 'C0040', 'C0041',  // Brake system issues
    'U0100', 'U0101', 'U0155'   // Communication issues with critical modules
  ];
  
  // Less urgent but should be addressed soon
  const mediumSeverityCodes = [
    'P0010', 'P0011', 'P0012', 'P0013', 'P0014', 'P0015',  // Camshaft timing/position issues
    'P0021', 'P0022',  // Camshaft position - Bank 2
    'P0102', 'P0103',  // MAF sensor issues
    'P0112', 'P0113',  // IAT sensor issues
    'P0116', 'P0117', 'P0118',  // Engine coolant temperature sensor issues
    'P0121', 'P0122', 'P0123',  // TPS sensor issues
    'P0131', 'P0132', 'P0133', 'P0134',  // O2 sensor issues
    'P0401', 'P0402',  // EGR system issues
    'P0420', 'P0430',  // Catalyst efficiency below threshold
    'B0001', 'B0002', 'B0010', 'B0020',  // Airbag system issues
  ];
  
  if (highSeverityCodes.includes(code)) {
    return 'high';
  } else if (mediumSeverityCodes.includes(code)) {
    return 'medium';
  } else {
    return 'low';
  }
}

/**
 * Provides common symptoms associated with OBD codes
 */
export function getCommonCodeSymptoms(code: string): string[] {
  // Map of some common codes and their symptoms
  const codeSymptoms: Record<string, string[]> = {
    'P0300': ['Check Engine Light', 'Engine Misfire', 'Rough Idle', 'Poor Acceleration', 'Increased Fuel Consumption'],
    'P0301': ['Check Engine Light', 'Cylinder 1 Misfire', 'Rough Idle', 'Engine Hesitation'],
    'P0302': ['Check Engine Light', 'Cylinder 2 Misfire', 'Rough Idle', 'Engine Hesitation'],
    'P0420': ['Check Engine Light', 'No Noticeable Symptoms', 'Possible Slight Decrease in Fuel Economy'],
    'P0171': ['Check Engine Light', 'Rough Idle', 'Poor Acceleration', 'Engine Hesitation', 'Increased Fuel Consumption'],
    'P0174': ['Check Engine Light', 'Rough Idle', 'Poor Acceleration', 'Engine Hesitation', 'Increased Fuel Consumption'],
    'P0401': ['Check Engine Light', 'Poor Acceleration', 'Rough Idle', 'Failed Emissions Test'],
    'P0455': ['Check Engine Light', 'Fuel Smell', 'No Performance Issues'],
    'P0011': ['Check Engine Light', 'Poor Idle', 'Reduced Engine Performance', 'Engine Stalling'],
    'P0440': ['Check Engine Light', 'Fuel Smell', 'Degraded Fuel Economy'],
    'P0700': ['Check Engine Light', 'Transmission Light', 'Harsh Shifting', 'Slip or Delayed Engagement']
  };
  
  return codeSymptoms[code] || ['Check Engine Light']; 
}

/**
 * Provides a layered explanation for an OBD code
 */
export function getCodeExplanation(code: string): {
  component: string;
  meaning: string;
  impact: string;
  possibleCauses: string[];
} {
  // This would ideally be a much larger database, but here's a sample for common codes
  const explanations: Record<string, {
    component: string;
    meaning: string;
    impact: string;
    possibleCauses: string[];
  }> = {
    'P0300': {
      component: 'Engine Cylinders',
      meaning: 'Random/Multiple Cylinder Misfire Detected',
      impact: 'Damages catalytic converter, reduces power, increases emissions, and wastes fuel',
      possibleCauses: [
        'Worn spark plugs or ignition coils',
        'Fuel injector problems',
        'Vacuum leaks',
        'Low compression',
        'Faulty oxygen sensor',
        'Contaminated fuel'
      ]
    },
    'P0420': {
      component: 'Catalytic Converter',
      meaning: 'Catalyst System Efficiency Below Threshold (Bank 1)',
      impact: 'Increases emissions, may cause slight reduction in fuel economy',
      possibleCauses: [
        'Failing catalytic converter',
        'Exhaust leaks',
        'Faulty oxygen sensors',
        'Engine misfires',
        'Oil contamination'
      ]
    },
    'P0171': {
      component: 'Fuel System',
      meaning: 'Fuel System Too Lean (Bank 1)',
      impact: 'Rough idle, reduced power, potential damage to catalytic converter',
      possibleCauses: [
        'Vacuum leaks',
        'Dirty MAF sensor',
        'Clogged fuel injectors',
        'Faulty oxygen sensor',
        'Low fuel pressure',
        'EGR valve issues'
      ]
    },
    'P0011': {
      component: 'Variable Valve Timing (VVT) System',
      meaning: 'Intake Camshaft Timing Over-Advanced (Bank 1)',
      impact: 'Poor fuel economy, reduced performance, rough idle, and potential no-start',
      possibleCauses: [
        'Low or dirty oil',
        'Failed VVT solenoid',
        'Timing chain issues',
        'Camshaft position sensor malfunction',
        'Engine oil pressure issues'
      ]
    }
  };
  
  // Return the explanation if we have it, or a generic one
  return explanations[code] || {
    component: 'Vehicle System',
    meaning: `Diagnostic Trouble Code ${code}`,
    impact: 'May affect vehicle performance, emissions, or safety depending on the specific issue',
    possibleCauses: [
      'Various components related to the specific system',
      'Electrical issues',
      'Sensor failures',
      'Mechanical problems'
    ]
  };
}
