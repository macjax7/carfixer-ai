
import { useCallback } from "react";
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';

export const useChatStorage = () => {
  const { toast } = useToast();

  // Store chat session in database
  const createChatSession = useCallback(async (userId: string, title: string) => {
    if (!userId) return null;
    
    try {
      const newId = uuidv4();
      const { error } = await supabase
        .from('chat_sessions')
        .insert({
          id: newId,
          user_id: userId,
          title: title.length > 50 ? title.substring(0, 47) + '...' : title
        });
        
      if (error) throw error;
      
      console.log("Created new chat session:", newId);
      return newId;
    } catch (error) {
      console.error("Error creating new chat session:", error);
      return null;
    }
  }, [toast]);

  // Update chat title
  const updateChatTitle = useCallback(async (chatId: string, userId: string, title: string) => {
    if (!userId || !chatId) return;
    
    try {
      const { error } = await supabase
        .from('chat_sessions')
        .update({ 
          title: title.length > 50 ? title.substring(0, 47) + '...' : title 
        })
        .eq('id', chatId);
        
      if (error) throw error;
    } catch (error) {
      console.error("Error updating chat title:", error);
    }
  }, []);

  // Store message in database
  const storeMessage = useCallback(async (
    chatId: string, 
    messageId: string, 
    content: string, 
    role: 'user' | 'assistant',
    imageUrl?: string
  ) => {
    try {
      const { error } = await supabase
        .from('chat_messages')
        .insert({
          id: messageId,
          session_id: chatId,
          role: role,
          content: content,
          image_url: imageUrl
        });
        
      if (error) {
        console.error("Error storing message:", error);
        return null;
      }
      
      return messageId;
    } catch (error) {
      console.error("Error storing message:", error);
      return null;
    }
  }, []);

  return {
    createChatSession,
    updateChatTitle,
    storeMessage
  };
};
