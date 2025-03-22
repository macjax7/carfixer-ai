
import { supabase } from '@/integrations/supabase/client';
import { useVehicles } from '@/context/VehicleContext';

export type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

/**
 * Send a message to the OpenAI API for chat completion
 */
export async function sendChatMessage(messages: ChatMessage[], includeVehicleContext = true, vehicleInfo = null) {
  try {
    // Filter messages to only include the required fields for the API
    const apiMessages = messages.map(({ role, content }) => ({ role, content }));
    
    const { data, error } = await supabase.functions.invoke('openai', {
      body: {
        service: 'diagnostic',
        action: 'chat',
        data: {
          messages: apiMessages,
          includeVehicleContext,
          vehicleInfo
        }
      }
    });

    if (error) throw new Error(error.message);
    return data.message;
  } catch (error) {
    console.error('Error sending chat message:', error);
    throw error;
  }
}

/**
 * Analyze an image using OpenAI's vision capabilities
 */
export async function analyzeImage(imageUrl: string, prompt?: string) {
  try {
    const { data, error } = await supabase.functions.invoke('openai', {
      body: {
        service: 'image',
        action: 'analyze',
        data: {
          image: imageUrl,
          prompt
        }
      }
    });

    if (error) throw new Error(error.message);
    return data.analysis;
  } catch (error) {
    console.error('Error analyzing image:', error);
    throw error;
  }
}

/**
 * Get diagnostic information for a DTC code or symptoms
 */
export async function getDiagnosticInfo(params: { 
  dtcCode?: string; 
  vehicleInfo?: any; 
  symptoms?: string[];
  noStart?: boolean;
}) {
  try {
    const { data, error } = await supabase.functions.invoke('openai', {
      body: {
        service: 'diagnostic',
        action: 'analyze',
        data: params
      }
    });

    if (error) throw new Error(error.message);
    return data.diagnostic;
  } catch (error) {
    console.error('Error getting diagnostic information:', error);
    throw error;
  }
}

/**
 * Look up part information
 */
export async function lookupPart(params: {
  partName: string;
  vehicleInfo?: any;
  partNumber?: string;
  oem?: boolean;
  aftermarket?: boolean;
}) {
  try {
    const { data, error } = await supabase.functions.invoke('openai', {
      body: {
        service: 'parts',
        action: 'lookup',
        data: params
      }
    });

    if (error) throw new Error(error.message);
    return data.parts;
  } catch (error) {
    console.error('Error looking up part:', error);
    throw error;
  }
}

/**
 * Get repair guidance
 */
export async function getRepairGuidance(params: {
  repairType: string;
  vehicleInfo?: any;
  partName?: string;
  dtcCode?: string;
}) {
  try {
    const { data, error } = await supabase.functions.invoke('openai', {
      body: {
        service: 'repair',
        action: 'guide',
        data: params
      }
    });

    if (error) throw new Error(error.message);
    return data.guidance;
  } catch (error) {
    console.error('Error getting repair guidance:', error);
    throw error;
  }
}

/**
 * Decode a VIN number to get vehicle details
 */
export async function decodeVIN(vin: string) {
  try {
    const { data, error } = await supabase.functions.invoke('openai', {
      body: {
        service: 'vehicle',
        action: 'decode-vin',
        data: { vin }
      }
    });

    if (error) throw new Error(error.message);
    return data;
  } catch (error) {
    console.error('Error decoding VIN:', error);
    throw error;
  }
}

/**
 * Get live OBD-II sensor data
 */
export async function getOBDSensorData() {
  try {
    const { data, error } = await supabase.functions.invoke('openai', {
      body: {
        service: 'vehicle',
        action: 'fetch-sensors',
        data: {}
      }
    });

    if (error) throw new Error(error.message);
    return data.sensors;
  } catch (error) {
    console.error('Error getting OBD sensor data:', error);
    throw error;
  }
}

/**
 * Custom hook to use the CarFix API with vehicle context
 */
export function useOpenAI() {
  const { selectedVehicle } = useVehicles();
  
  const chatWithAI = async (messages: ChatMessage[], includeVehicleContext = true) => {
    return sendChatMessage(messages, includeVehicleContext, selectedVehicle);
  };
  
  const identifyPart = async (imageUrl: string, customPrompt?: string) => {
    const prompt = customPrompt || `Identify this car part and explain its purpose. ${
      selectedVehicle ? `This is from a ${selectedVehicle.year} ${selectedVehicle.make} ${selectedVehicle.model}.` : ''
    }`;
    
    return analyzeImage(imageUrl, prompt);
  };
  
  const getDiagnostics = async (params: {
    dtcCode?: string;
    symptoms?: string[];
    noStart?: boolean;
  }) => {
    return getDiagnosticInfo({
      ...params,
      vehicleInfo: selectedVehicle
    });
  };
  
  const findParts = async (params: {
    partName: string;
    partNumber?: string;
    oem?: boolean;
    aftermarket?: boolean;
  }) => {
    return lookupPart({
      ...params,
      vehicleInfo: selectedVehicle
    });
  };
  
  const getRepairSteps = async (params: {
    repairType: string;
    partName?: string;
    dtcCode?: string;
  }) => {
    return getRepairGuidance({
      ...params,
      vehicleInfo: selectedVehicle
    });
  };
  
  const decodeVehicleVIN = async (vin: string) => {
    return decodeVIN(vin);
  };
  
  const getOBDData = async () => {
    return getOBDSensorData();
  };
  
  return {
    chatWithAI,
    identifyPart,
    getDiagnostics,
    findParts,
    getRepairSteps,
    decodeVehicleVIN,
    getOBDData
  };
}
