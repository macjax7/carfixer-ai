
import { useState, useCallback } from "react";
import { nanoid } from "nanoid";
import { Message } from "@/components/chat/types";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useChatMessages } from "./useChatMessages";
import { useOpenAI } from "@/utils/openai";

export const useMessageSender = () => {
  const { user } = useAuth();
  const { addUserMessage, addAIMessage, chatId, setChatId } = useChatMessages();
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Use the OpenAI utility directly
  const { sendMessage: sendToChatService, analyzeListing, identifyPart, detectCodeType } = useOpenAI();

  const addToChatHistory = useCallback(async (
    newChatId: string, 
    message: Message, 
    role: 'user' | 'assistant'
  ) => {
    if (user) {
      try {
        await supabase
          .from('chat_messages')
          .insert({
            session_id: newChatId,
            content: message.text,
            role: role,
            image_url: message.image
          });
      } catch (error) {
        console.error('Error saving message to database:', error);
      }
    }
  }, [user]);

  const processAndSendMessage = useCallback(async (text: string, image?: string) => {
    if (!text.trim() && !image) return;
    
    setIsProcessing(true);
    
    try {
      // Create or ensure chat ID exists
      const newChatId = chatId || nanoid();
      if (!chatId) {
        setChatId(newChatId);
        
        // Create chat session in database
        if (user) {
          try {
            await supabase
              .from('chat_sessions')
              .insert({
                id: newChatId,
                user_id: user.id,
                title: text.substring(0, 30) + (text.length > 30 ? '...' : '')
              });
          } catch (error) {
            console.error('Error creating chat session:', error);
          }
        }
      }
      
      // Add user message to the chat
      const userMessage = await addUserMessage(text, image);
      
      // Determine the message type (image analysis, URL, or regular text)
      let aiResponseText = '';
      let aiMessageExtra = {};
      
      if (image) {
        // Process image-based query
        try {
          const imageResult = await identifyPart(image, text);
          aiResponseText = imageResult.text;
          if (imageResult.componentDiagram) {
            aiMessageExtra = { componentDiagram: imageResult.componentDiagram };
          }
        } catch (error) {
          console.error("Error processing image:", error);
          aiResponseText = "I'm sorry, I couldn't analyze that image properly. Could you try with a clearer picture?";
        }
      } else if (/https?:\/\/[^\s]+/.test(text)) {
        // Process URL-based query
        try {
          const urlResults = await analyzeListing(text);
          if (urlResults.vehicleListingAnalysis) {
            aiResponseText = urlResults.text;
            aiMessageExtra = { vehicleListingAnalysis: urlResults.vehicleListingAnalysis };
          } else {
            // If it's not a vehicle listing, just process as a normal query
            aiResponseText = await sendToChatService(text, newChatId);
          }
        } catch (error) {
          console.error("Error processing URL:", error);
          aiResponseText = await sendToChatService(text, newChatId);
        }
      } else {
        // Process code detection for diagnostic codes
        const codeType = detectCodeType ? detectCodeType(text) : null;
        if (codeType) {
          aiResponseText = await sendToChatService(text, newChatId, codeType);
        } else {
          // Process normal text query
          aiResponseText = await sendToChatService(text, newChatId);
        }
      }
      
      // Add AI response to the chat
      const aiMessage = await addAIMessage(aiResponseText, aiMessageExtra);
      
      return aiMessage;
    } catch (error) {
      console.error("Error processing message:", error);
      
      // Show error message
      const errorMessage = await addAIMessage(
        "I'm sorry, I encountered an error processing your request. Please try again."
      );
      
      return errorMessage;
    } finally {
      setIsProcessing(false);
    }
  }, [chatId, setChatId, user, addUserMessage, addAIMessage, sendToChatService, identifyPart, analyzeListing, detectCodeType]);

  return {
    processAndSendMessage,
    isProcessing
  };
};
