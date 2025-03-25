
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
    
    console.log("Preparing to invoke Supabase function with payload:", {
      service: 'diagnostic',
      action: 'chat',
      messages: apiMessages.length,
      includeVehicleContext,
      hasVehicleInfo: !!vehicleInfo,
      messageHistoryLength: messageHistory.length
    });
    
    // Log the first and last message for debugging
    if (apiMessages.length > 0) {
      console.log("First message:", apiMessages[0]);
      console.log("Last message:", apiMessages[apiMessages.length - 1]);
    }
    
    // Log vehicle info for debugging
    if (vehicleInfo) {
      console.log("Vehicle context being sent:", vehicleInfo);
    }
    
    // Add timeout to prevent hanging requests
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error("API request timed out after 30 seconds")), 30000)
    );
    
    console.log("Invoking Supabase function 'openai'...");
    
    const apiPromise = supabase.functions.invoke('openai', {
      body: {
        service: 'diagnostic',
        action: 'chat',
        data: {
          messages: apiMessages,
          includeVehicleContext,
          vehicleInfo,
          messageHistory,
          useHighQualityModel: true // Always use the high-quality model for better responses
        }
      }
    });
    
    // Race between the API call and the timeout
    const response = await Promise.race([apiPromise, timeoutPromise]) as any;
    console.log("Received response from Supabase function:", response ? "success" : "no response");
    
    const { data, error } = response || {};

    if (error) {
      console.error("Supabase function error:", error);
      throw new Error(`OpenAI API error: ${error.message || JSON.stringify(error)}`);
    }
    
    if (!data) {
      console.error("No data received from Supabase function");
      throw new Error("Empty response received from API");
    }
    
    console.log("Response data structure:", Object.keys(data));
    
    // Return specifically the message property from the response
    if (data && data.message) {
      console.log("Message received, length:", data.message.length);
      console.log("Message preview:", data.message.substring(0, 250) + "...");
      return data.message;
    } else if (data) {
      console.warn("Unexpected response format. Full response:", data);
      const responseText = typeof data === 'string' ? data : JSON.stringify(data);
      console.log("Converted response:", responseText.substring(0, 250) + "...");
      return responseText;
    } else {
      throw new Error("Empty response received from OpenAI API");
    }
  } catch (error) {
    console.error('Error sending chat message:', error);
    throw error;
  }
}
