
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
    
    // Log if we're using a system prompt
    if (systemPrompt) {
      console.log("Using custom system prompt:", systemPrompt.substring(0, 100) + "...");
    }

    try {
      // Attempt to call the Supabase function
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
      console.error('Error calling Supabase function:', error);
      
      // Generate a fallback response if the Edge Function cannot be reached
      const lastUserMessage = messages.filter(msg => msg.role === 'user').pop();
      const userText = lastUserMessage ? lastUserMessage.content : '';
      
      if (error.message.includes('Failed to send a request to the Edge Function')) {
        // Fallback for connectivity issues
        console.log("Using local fallback response due to Edge Function connectivity issue");
        return "I'm sorry, I'm having trouble connecting to my knowledge database right now. Please check your internet connection and try again in a moment.";
      } else {
        // Generic error fallback
        throw error;
      }
    }
  } catch (error) {
    console.error('Error sending chat message:', error);
    throw error;
  }
}
