
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
        action: 'analyze-image',
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
 * Custom hook to use the OpenAI API with vehicle context
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
  
  return {
    chatWithAI,
    identifyPart
  };
}
