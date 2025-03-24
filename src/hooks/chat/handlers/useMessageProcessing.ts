
import { useCallback } from "react";
import { Message } from "@/components/chat/types";
import { ChatMessage } from "@/utils/openai/types";
import { useOpenAI } from "@/utils/openai/hook";

export const useMessageProcessing = () => {
  const { chatWithAI, analyzeListing } = useOpenAI();

  // Process AI response for a message
  const processAIResponse = useCallback(async (
    userText: string,
    userImage?: string,
    contextMessages: Message[] = []
  ) => {
    try {
      console.log("Processing AI response for:", userText);
      
      // Check for URL-based query
      if (/https?:\/\/[^\s]+/.test(userText)) {
        console.log("Processing URL-based query");
        const urlResults = await analyzeListing(userText);
        
        if (urlResults.vehicleListingAnalysis) {
          return {
            text: urlResults.text,
            extra: { vehicleListingAnalysis: urlResults.vehicleListingAnalysis }
          };
        }
      }
      
      // Convert previous messages for context
      const previousMessages: ChatMessage[] = contextMessages.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text
      }));
      
      // Combine with current message
      const allMessages: ChatMessage[] = [...previousMessages, { role: 'user', content: userText }];
      
      // Get response from AI
      const aiResponseText = await chatWithAI(allMessages);
      
      return { 
        text: aiResponseText || "Sorry, I couldn't process your request",
        extra: {}
      };
    } catch (error) {
      console.error("Error processing AI response:", error);
      throw error;
    }
  }, [chatWithAI, analyzeListing]);

  return {
    processAIResponse
  };
};
