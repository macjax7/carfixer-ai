
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

    if (error) throw new Error(error.message);
    return data;
  } catch (error) {
    console.error('Error sending chat message:', error);
    throw error;
  }
}
