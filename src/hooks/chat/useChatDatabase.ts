
import { useState, useCallback } from "react";
import { v4 as uuidv4 } from 'uuid';
import { Message } from "@/components/chat/types";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

export const useChatDatabase = () => {
  const { user } = useAuth();

  const addToChatHistory = useCallback(async (
    chatId: string, 
    message: Message, 
    role: 'user' | 'assistant'
  ) => {
    if (user) {
      try {
        console.log(`Adding ${role} message to chat history:`, message);
        // Generate a proper UUID for the message
        const messageId = uuidv4();
        
        await supabase
          .from('chat_messages')
          .insert({
            id: messageId,
            session_id: chatId,
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

  const createChatSession = useCallback(async (
    title: string,
    userId: string
  ) => {
    try {
      // Generate a proper UUID for the chat session
      const chatId = uuidv4();
      
      console.log("Creating new chat session in database:", { id: chatId, title });
      await supabase
        .from('chat_sessions')
        .insert({
          id: chatId,
          user_id: userId,
          title
        });
      console.log("Successfully created chat session");
      return chatId;
    } catch (error) {
      console.error('Error creating chat session:', error);
      return null;
    }
  }, []);

  const updateChatSessionTitle = useCallback(async (
    chatId: string,
    title: string
  ) => {
    try {
      console.log("Updating chat session title:", title);
      await supabase
        .from('chat_sessions')
        .update({ title })
        .eq('id', chatId);
    } catch (error) {
      console.error('Error updating chat session title:', error);
    }
  }, []);

  const getChatMessageCount = useCallback(async (chatId: string) => {
    try {
      console.log("Getting message count for session:", chatId);
      const { data, error, count } = await supabase
        .from('chat_messages')
        .select('id', { count: 'exact' })
        .eq('session_id', chatId);
        
      if (error) {
        console.error('Error in getChatMessageCount:', error);
        throw error;
      }
      
      console.log("Message count result:", count || data?.length || 0);
      return count || data?.length || 0;
    } catch (error) {
      console.error('Error getting message count:', error);
      return 0;
    }
  }, []);

  return {
    addToChatHistory,
    createChatSession,
    updateChatSessionTitle,
    getChatMessageCount
  };
};
