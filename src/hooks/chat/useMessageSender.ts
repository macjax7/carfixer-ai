
import { useState, useCallback } from "react";
import { nanoid } from "nanoid";
import { Message } from "@/components/chat/types";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useChatMessages } from "./useChatMessages";
import { useOpenAI } from "@/utils/openai/hook";
import { useCodeDetection } from "./useCodeDetection";
import { useToast } from "@/hooks/use-toast";

export const useMessageSender = () => {
  const { user } = useAuth();
  const { addUserMessage, addAIMessage, chatId, setChatId } = useChatMessages();
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  
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
        console.log(`Adding ${role} message to chat history:`, message);
        await supabase
          .from('chat_messages')
          .insert({
            session_id: newChatId,
            content: message.text,
            role: role,
            image_url: message.image
          });
        console.log(`Successfully added ${role} message to chat history`);
      } catch (error) {
        console.error('Error saving message to database:', error);
      }
    }
  }, [user]);

  const processAndSendMessage = useCallback(async (text: string, image?: string) => {
    if (!text.trim() && !image) return;
    
    setIsProcessing(true);
    console.log("Processing message:", text, image ? "(with image)" : "");
    
    try {
      // Create or ensure chat ID exists
      const newChatId = chatId || nanoid();
      if (!chatId) {
        console.log("Creating new chat with ID:", newChatId);
        setChatId(newChatId);
        
        // Create chat session in database with a descriptive title
        if (user) {
          try {
            const title = text.length > 30 
              ? text.substring(0, 30) + '...' 
              : text;
              
            console.log("Creating new chat session in database:", { id: newChatId, title });
            await supabase
              .from('chat_sessions')
              .insert({
                id: newChatId,
                user_id: user.id,
                title
              });
            console.log("Successfully created chat session");
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
              
            console.log("Updating chat session title:", title);
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
      
      console.log("Adding user message to chat:", userMessageData);
      addUserMessage(userMessageData);
      
      // Also add it to the database
      if (user) {
        await addToChatHistory(newChatId, userMessageData, 'user');
      }
      
      // Determine the message type (image analysis, URL, or regular text)
      let aiResponseText = '';
      let aiMessageExtra = {};
      
      try {
        if (image) {
          // Process image-based query
          console.log("Processing image-based query");
          const imageResult = await identifyPart(image, text);
          aiResponseText = imageResult.text;
          if (imageResult.componentDiagram) {
            aiMessageExtra = { componentDiagram: imageResult.componentDiagram };
          }
        } else if (/https?:\/\/[^\s]+/.test(text)) {
          // Process URL-based query
          console.log("Processing URL-based query");
          const urlResults = await analyzeListing(text);
          if (urlResults.vehicleListingAnalysis) {
            aiResponseText = urlResults.text;
            aiMessageExtra = { vehicleListingAnalysis: urlResults.vehicleListingAnalysis };
          } else {
            // If it's not a vehicle listing, just process as a normal query
            console.log("URL doesn't appear to be a vehicle listing, processing as normal text");
            aiResponseText = await chatWithAI([{ role: 'user', content: text }]);
          }
        } else {
          // Process code detection for diagnostic codes
          console.log("Processing text query");
          const codeType = processCodeType(text);
          if (codeType) {
            console.log("Detected code type:", codeType);
            aiResponseText = await chatWithAI([{ role: 'user', content: text }], true, null, [codeType]);
          } else {
            // Process normal text query
            console.log("No code detected, processing as normal text");
            aiResponseText = await chatWithAI([{ role: 'user', content: text }]);
          }
        }
      } catch (error) {
        console.error("Error in AI processing:", error);
        aiResponseText = "I apologize, but I encountered an error processing your request. Please try again.";
        toast({
          variant: "destructive",
          title: "AI Processing Error",
          description: "Failed to get a response from OpenAI. Please check your connection or try again later."
        });
      }
      
      // Add AI response to the chat
      const aiMessageData = {
        id: nanoid(),
        sender: 'ai' as const,
        text: aiResponseText,
        timestamp: new Date(),
        ...aiMessageExtra
      };
      
      console.log("Adding AI response to chat:", aiMessageData);
      addAIMessage(aiMessageData);
      
      // Also add it to the database
      if (user) {
        await addToChatHistory(newChatId, aiMessageData, 'assistant');
      }
      
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
      toast({
        variant: "destructive",
        title: "Processing Error",
        description: "An error occurred while processing your message. Please try again."
      });
      
      return errorMessageData;
    } finally {
      setIsProcessing(false);
    }
  }, [chatId, setChatId, user, addUserMessage, addAIMessage, chatWithAI, identifyPart, analyzeListing, processCodeType, addToChatHistory, toast]);

  return {
    processAndSendMessage,
    isProcessing
  };
};
