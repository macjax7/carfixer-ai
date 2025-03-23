
import { useChat } from "./useChat";
import { useChatMessages } from "./useChatMessages";
import { useState, useCallback } from "react";
import { nanoid } from "nanoid";
import { Message } from "@/components/chat/types";
import { useImageHandler } from "./useImageHandler";
import { useListingHandler } from "./useListingHandler";
import { useCodeDetection } from "./useCodeDetection";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

export const useMessageSender = () => {
  const { sendToChatService } = useChat();
  const { addMessage, chatId, setChatId } = useChatMessages();
  const [isProcessing, setIsProcessing] = useState(false);
  const { processImage } = useImageHandler();
  const { processListing } = useListingHandler();
  const { processCodeType } = useCodeDetection();
  const { user } = useAuth();

  const createMessage = useCallback((text: string, sender: 'user' | 'ai', image?: string): Message => {
    return {
      id: nanoid(),
      sender,
      text,
      timestamp: new Date(),
      image,
    };
  }, []);

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
      // Create message ID for this interaction
      const userMessage = createMessage(text, 'user', image);
      
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
      addMessage(userMessage);
      
      // Save user message to database
      await addToChatHistory(newChatId, userMessage, 'user');
      
      // Determine the message type (image analysis, URL, or regular text)
      let aiResponseText = '';
      let aiMessageExtra = {};
      
      if (image) {
        // Process image-based query
        const imageResult = await processImage(image, text, newChatId);
        aiResponseText = imageResult.text;
        if (imageResult.componentDiagram) {
          aiMessageExtra = { componentDiagram: imageResult.componentDiagram };
        }
      } else if (/https?:\/\/[^\s]+/.test(text)) {
        // Process URL-based query
        try {
          const urlResults = await processListing(text);
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
        const codeType = processCodeType(text);
        if (codeType) {
          aiResponseText = await sendToChatService(text, newChatId, codeType);
        } else {
          // Process normal text query
          aiResponseText = await sendToChatService(text, newChatId);
        }
      }
      
      // Create the AI response message
      const aiMessage = createMessage(aiResponseText, 'ai');
      
      // Add any extra data to the message
      Object.assign(aiMessage, aiMessageExtra);
      
      // Add AI response to the chat
      addMessage(aiMessage);
      
      // Save AI message to database
      await addToChatHistory(newChatId, aiMessage, 'assistant');
      
      return aiMessage;
    } catch (error) {
      console.error("Error processing message:", error);
      
      // Show error message
      const errorMessage = createMessage(
        "I'm sorry, I encountered an error processing your request. Please try again.",
        'ai'
      );
      addMessage(errorMessage);
      
      // Save error message to database
      if (chatId) {
        await addToChatHistory(chatId, errorMessage, 'assistant');
      }
      
      return errorMessage;
    } finally {
      setIsProcessing(false);
    }
  }, [createMessage, addMessage, chatId, setChatId, processImage, processListing, processCodeType, sendToChatService, user, addToChatHistory]);

  return {
    processAndSendMessage,
    isProcessing
  };
};
