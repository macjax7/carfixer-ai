
import { supabase } from '@/integrations/supabase/client';
import { ChatMessage } from './types';

/**
 * Send a message to the OpenAI API for chat completion
 */
export async function sendChatMessage(
  messages: ChatMessage[], 
  includeVehicleContext = true, 
  vehicleInfo = null, 
  messageHistory: string[] = [],
  systemPrompt?: string
) {
  try {
    // Filter messages to only include the required fields for the API
    const apiMessages = messages.map(({ role, content }) => ({ role, content }));
    
    console.log("Preparing to invoke Supabase function with payload:", {
      service: 'diagnostic',
      action: 'chat',
      messages: apiMessages.length,
      includeVehicleContext,
      hasVehicleInfo: !!vehicleInfo,
      messageHistoryLength: messageHistory.length,
      hasSystemPrompt: !!systemPrompt
    });
    
    // Check if we're connected to Supabase
    console.log("Checking Supabase connection before API call...");
    
    // Add timeout to prevent hanging requests
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error("API request timed out")), 30000)
    );
    
    const apiPromise = supabase.functions.invoke('openai', {
      body: {
        service: 'diagnostic',
        action: 'chat',
        data: {
          messages: apiMessages,
          includeVehicleContext,
          vehicleInfo,
          messageHistory,
          systemPrompt
        }
      }
    });
    
    // Race between the API call and the timeout
    const response = await Promise.race([apiPromise, timeoutPromise]) as any;
    const { data, error } = response || {};

    if (error) {
      console.error("Supabase function error:", error);
      throw new Error(`OpenAI API error: ${error.message}`);
    }
    
    console.log("Received response from Supabase function:", data ? "success" : "no data");
    
    // Return specifically the message property from the response
    if (data && data.message) {
      return data.message;
    } else if (data) {
      console.warn("Unexpected response format. Full response:", data);
      return typeof data === 'string' ? data : JSON.stringify(data);
    } else {
      throw new Error("Empty response received from OpenAI API");
    }
  } catch (error) {
    console.error('Error sending chat message:', error);
    throw error;
  }
}
