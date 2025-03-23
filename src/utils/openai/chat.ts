
import { supabase } from '@/integrations/supabase/client';
import { ChatMessage } from './types';

/**
 * Send a message to the OpenAI API for chat completion
 */
export async function sendChatMessage(
  messages: ChatMessage[], 
  includeVehicleContext = true, 
  vehicleInfo = null,
  messageHistory: string[] = []
) {
  try {
    // Filter messages to only include the required fields for the API
    const apiMessages = messages.map(({ role, content }) => ({ role, content }));
    
    console.log("Invoking Supabase function with payload:", {
      service: 'diagnostic',
      action: 'chat',
      data: {
        messages: apiMessages,
        includeVehicleContext,
        vehicleInfo,
        messageHistory
      }
    });
    
    // Check if we're connected to Supabase
    console.log("Checking Supabase connection before API call...");
    
    const { data, error } = await supabase.functions.invoke('openai', {
      body: {
        service: 'diagnostic',
        action: 'chat',
        data: {
          messages: apiMessages,
          includeVehicleContext,
          vehicleInfo,
          messageHistory
        }
      }
    });

    if (error) {
      console.error("Supabase function error:", error);
      throw new Error(`OpenAI API error: ${error.message}`);
    }
    
    console.log("Received response from Supabase function:", data);
    return data;
  } catch (error) {
    console.error('Error sending chat message:', error);
    throw error;
  }
}
