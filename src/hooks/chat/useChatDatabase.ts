
import { useCallback } from "react";
import { v4 as uuidv4 } from 'uuid';
import { Message } from "@/components/chat/types";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { isValidUUID } from '@/utils/uuid';
import { useToast } from '@/hooks/use-toast';

export const useChatDatabase = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const addToChatHistory = useCallback(async (
    chatId: string, 
    message: Message, 
    role: 'user' | 'assistant'
  ) => {
    if (!chatId) {
      console.error('Cannot add message to chat history: no chatId provided');
      return;
    }
    
    if (!user) {
      console.error('Cannot add message to chat history: no user logged in');
      return;
    }
    
    if (!isValidUUID(chatId)) {
      console.error('Cannot add message to chat history: invalid UUID format for chatId', chatId);
      return;
    }
    
    try {
      console.log(`Adding ${role} message to chat history:`, message.id, 'with chat ID:', chatId);
      
      // Generate a proper UUID for the message if not already present
      const messageId = message.id && isValidUUID(message.id) ? message.id : uuidv4();
      
      // First verify that the chat session exists and belongs to the user
      const { data: sessionData, error: sessionError } = await supabase
        .from('chat_sessions')
        .select('id')
        .eq('id', chatId)
        .eq('user_id', user.id)
        .single();
        
      if (sessionError) {
        console.error('Error verifying chat session ownership:', sessionError);
        
        // Create the session if it doesn't exist
        if (sessionError.code === 'PGRST116') {
          console.log('Chat session not found, creating a new session');
          const { error: createError } = await supabase
            .from('chat_sessions')
            .insert({
              id: chatId,
              user_id: user.id,
              title: message.text.substring(0, 30) + (message.text.length > 30 ? '...' : '')
            });
            
          if (createError) {
            console.error('Error creating new chat session:', createError);
            throw createError;
          }
          console.log('Created new chat session with ID:', chatId);
        } else {
          throw sessionError;
        }
      }
      
      // Now insert the message
      const { error } = await supabase
        .from('chat_messages')
        .insert({
          id: messageId,
          session_id: chatId,
          content: message.text,
          role: role,
          image_url: message.image
        });
        
      if (error) {
        console.error("Database error:", error);
        
        if (error.code === 'PGRST301') {
          toast({
            title: "Permission Error",
            description: "You don't have permission to write messages to this chat",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Message Error",
            description: "Failed to save your message",
            variant: "destructive"
          });
        }
        throw error;
      }
      
      console.log(`Successfully added ${role} message to chat history with ID:`, messageId);
      return messageId;
    } catch (error) {
      console.error('Error saving message to database:', error);
      return null;
    }
  }, [user, toast]);

  const createChatSession = useCallback(async (
    title: string,
    userId: string
  ) => {
    if (!userId) {
      console.error('Cannot create chat session: no user ID provided');
      return null;
    }
    
    try {
      // Generate a proper UUID for the chat session
      const chatId = uuidv4();
      
      console.log("Creating new chat session in database:", { id: chatId, title, userId });
      const { error } = await supabase
        .from('chat_sessions')
        .insert({
          id: chatId,
          user_id: userId,
          title
        });
        
      if (error) {
        console.error("Database error:", error);
        
        if (error.code === 'PGRST301') {
          toast({
            title: "Permission Error",
            description: "You don't have permission to create chat sessions",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Session Error",
            description: "Failed to create a new chat session",
            variant: "destructive"
          });
        }
        throw error;
      }
      
      console.log("Successfully created chat session with ID:", chatId);
      return chatId;
    } catch (error) {
      console.error('Error creating chat session:', error);
      return null;
    }
  }, [toast]);

  const updateChatSessionTitle = useCallback(async (
    chatId: string,
    title: string
  ) => {
    if (!chatId || !isValidUUID(chatId)) {
      console.error('Cannot update chat session title: invalid chat ID', chatId);
      return;
    }
    
    if (!user) {
      console.error('Cannot update chat session title: no user logged in');
      return;
    }
    
    try {
      console.log("Updating chat session title:", title, "for ID:", chatId);
      const { error } = await supabase
        .from('chat_sessions')
        .update({ title })
        .eq('id', chatId)
        .eq('user_id', user.id);
        
      if (error) {
        console.error("Database error:", error);
        throw error;
      }
      
      console.log("Successfully updated chat session title");
    } catch (error) {
      console.error('Error updating chat session title:', error);
    }
  }, [user]);

  const getChatMessageCount = useCallback(async (chatId: string) => {
    if (!chatId || !isValidUUID(chatId)) {
      console.error('Cannot get message count: invalid chat ID', chatId);
      return 0;
    }
    
    if (!user) {
      console.error('Cannot get message count: no user logged in');
      return 0;
    }
    
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
  }, [user]);

  return {
    addToChatHistory,
    createChatSession,
    updateChatSessionTitle,
    getChatMessageCount
  };
};
