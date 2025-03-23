
import { useState, useCallback } from "react";
import { nanoid } from "nanoid";
import { Message } from "@/components/chat/types";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useChatMessages } from "./useChatMessages";
import { useOpenAI } from "@/utils/openai/hook";
import { useCodeDetection } from "./useCodeDetection";

export const useMessageSender = () => {
  const { user } = useAuth();
  const { addUserMessage, addAIMessage, chatId, setChatId } = useChatMessages();
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Use the OpenAI utility
  const { chatWithAI, analyzeListing, identifyPart } = useOpenAI();
  const { processCodeType } = useCodeDetection();

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
        
        // Create chat session in database with a descriptive title
        if (user) {
          try {
            const title = text.length > 30 
              ? text.substring(0, 30) + '...' 
              : text;
              
            await supabase
              .from('chat_sessions')
              .insert({
                id: newChatId,
                user_id: user.id,
                title
              });
          } catch (error) {
            console.error('Error creating chat session:', error);
          }
        }
      } else {
        // Update the title when it's the first message in an existing chat
        if (user) {
          const { data: messageCount } = await supabase
            .from('chat_messages')
            .select('id', { count: 'exact' })
            .eq('session_id', chatId);
            
          if (messageCount === null || messageCount.length === 0) {
            const title = text.length > 30 
              ? text.substring(0, 30) + '...' 
              : text;
              
            await supabase
              .from('chat_sessions')
              .update({ title })
              .eq('id', chatId);
          }
        }
      }
      
      // Add user message to the chat
      const userMessageData = {
        id: nanoid(),
        sender: 'user' as const,
        text,
        timestamp: new Date(),
        image
      };
      
      addUserMessage(userMessageData);
      
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
            aiResponseText = await chatWithAI([{ role: 'user', content: text }]);
          }
        } catch (error) {
          console.error("Error processing URL:", error);
          aiResponseText = await chatWithAI([{ role: 'user', content: text }]);
        }
      } else {
        // Process code detection for diagnostic codes
        const codeType = processCodeType(text);
        if (codeType) {
          aiResponseText = await chatWithAI([{ role: 'user', content: text }], true, null, [codeType]);
        } else {
          // Process normal text query
          aiResponseText = await chatWithAI([{ role: 'user', content: text }]);
        }
      }
      
      // Add AI response to the chat
      const aiMessageData = {
        id: nanoid(),
        sender: 'ai' as const,
        text: aiResponseText,
        timestamp: new Date(),
        ...aiMessageExtra
      };
      
      addAIMessage(aiMessageData);
      
      return aiMessageData;
    } catch (error) {
      console.error("Error processing message:", error);
      
      // Show error message
      const errorMessageData = {
        id: nanoid(),
        sender: 'ai' as const,
        text: "I'm sorry, I encountered an error processing your request. Please try again.",
        timestamp: new Date()
      };
      
      addAIMessage(errorMessageData);
      
      return errorMessageData;
    } finally {
      setIsProcessing(false);
    }
  }, [chatId, setChatId, user, addUserMessage, addAIMessage, chatWithAI, identifyPart, analyzeListing, processCodeType]);

  return {
    processAndSendMessage,
    isProcessing
  };
};
