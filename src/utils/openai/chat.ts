
import { supabase } from '@/integrations/supabase/client';
import { ChatMessage } from './types';

const TIMEOUT_DURATION = 20000; // 20 seconds timeout

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
    
    // Log if we're using a system prompt
    if (systemPrompt) {
      console.log("Using custom system prompt:", systemPrompt.substring(0, 100) + "...");
    }

    // Local response generation function for fallbacks
    const generateLocalResponse = (userMessage: string) => {
      // Extract the last user message to tailor the fallback
      const lastUserMessage = messages.filter(msg => msg.role === 'user').pop();
      const userText = lastUserMessage ? lastUserMessage.content : '';
      
      if (userText.toLowerCase().includes('obd') || userText.match(/[P|C|B|U][0-9]{4}/i)) {
        return "I'm currently unable to analyze diagnostic codes. Please try again when your connection is more stable.";
      }
      
      if (userText.toLowerCase().includes('help') || userText.toLowerCase().includes('assist')) {
        return "I'd be happy to help with your automotive questions once the connection is restored. Please try again in a moment.";
      }
      
      return "I'm having trouble connecting to my knowledge database right now. Please check your internet connection and try again in a moment.";
    };

    try {
      // Add timeout to prevent hanging requests
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("API request timed out")), TIMEOUT_DURATION)
      );
      
      console.log("Checking Supabase connection before API call...");
      
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
      
      // Check for specific error types to provide better fallbacks
      if (error.message?.includes('Failed to send a request to the Edge Function')) {
        console.log("Using local fallback response due to Edge Function connectivity issue");
        const lastUserMessage = messages.filter(msg => msg.role === 'user').pop();
        return generateLocalResponse(lastUserMessage?.content || '');
      } else if (error.message?.includes('API request timed out')) {
        console.log("Request timed out, using timeout fallback response");
        return "The request took too long to process. This might be due to high server load or connectivity issues. Please try again in a moment.";
      } else {
        // For unknown errors, throw to be caught by the outer catch
        throw error;
      }
    }
  } catch (error) {
    console.error('Error sending chat message:', error);
    
    // Create a more informative fallback response
    if (error.message?.includes('API key') || error.message?.includes('authentication')) {
      return "I'm experiencing authentication issues with my knowledge services. Please try again later.";
    } else if (error.message?.includes('rate limit') || error.message?.includes('too many requests')) {
      return "I'm currently handling too many requests. Please try again in a few minutes.";
    } else {
      return "I'm sorry, I'm having trouble connecting to my knowledge database right now. Please check your internet connection and try again in a moment.";
    }
  }
}
