
import { supabase } from '@/integrations/supabase/client';
import { ChatMessage } from './types';

const TIMEOUT_DURATION = 30000; // 30 seconds timeout for longer responses

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
  // Create a simplified error message handler
  const createErrorResponse = (message: string) => {
    console.error(`Chat error: ${message}`);
    return message;
  };

  try {
    // Filter messages to only include the required fields for the API
    const apiMessages = messages.map(({ role, content }) => ({ role, content }));
    
    console.log("Preparing to invoke Supabase function with payload:", {
      service: 'diagnostic',
      action: 'chat',
      messages: apiMessages.length,
      includeVehicleContext,
      hasVehicleInfo: !!vehicleInfo
    });

    // Add timeout to prevent hanging requests
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error("Request timed out")), TIMEOUT_DURATION)
    );
    
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
      return createErrorResponse(`Sorry, I encountered a service error. Please try again in a moment.`);
    }
    
    console.log("Received response from Supabase function:", data ? "success" : "no data");
    
    // Handle the response correctly
    if (data && data.message) {
      return data.message;
    } else if (data) {
      return typeof data === 'string' ? data : JSON.stringify(data);
    } else {
      return createErrorResponse("I received an empty response. Please try again.");
    }
  } catch (error) {
    console.error('Error in sendChatMessage:', error);
    
    // Provide a simple, direct error message without complex fallback logic
    return "I'm experiencing technical difficulties right now. Please try again in a few moments.";
  }
}
