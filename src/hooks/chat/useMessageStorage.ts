
import { useCallback } from 'react';
import { Message } from '@/components/chat/types';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { v4 as uuidv4 } from 'uuid';

export const useMessageStorage = () => {
  const { user } = useAuth();

  const storeUserMessage = useCallback(async (messageData: Message, sessionId: string) => {
    if (!user || !sessionId) return;

    try {
      console.log(`Storing user message to database:`, { message: messageData, sessionId });
      
      // Generate a proper UUID for the message
      const messageId = uuidv4();
      
      await supabase
        .from('chat_messages')
        .insert({
          id: messageId,
          session_id: sessionId,
          role: 'user',
          content: messageData.text,
          image_url: messageData.image
        });
        
      console.log('Successfully stored user message');
    } catch (error) {
      console.error("Error storing user message:", error);
    }
  }, [user]);

  const storeAIMessage = useCallback(async (messageData: Message, sessionId: string) => {
    if (!user || !sessionId) return;

    try {
      console.log(`Storing AI message to database:`, { message: messageData, sessionId });
      
      // Generate a proper UUID for the message
      const messageId = uuidv4();
      
      await supabase
        .from('chat_messages')
        .insert({
          id: messageId,
          session_id: sessionId,
          role: 'assistant',
          content: messageData.text
        });
        
      console.log('Successfully stored AI message');
    } catch (error) {
      console.error("Error storing AI message:", error);
    }
  }, [user]);

  // Add the fetchChatMessages function
  const fetchChatMessages = useCallback(async (sessionId: string) => {
    try {
      console.log(`Fetching messages for chat session:`, sessionId);
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });
        
      if (error) {
        console.error("Error fetching chat messages:", error);
        return [];
      }
      
      console.log(`Retrieved ${data?.length || 0} messages for session ${sessionId}`);
      return data || [];
    } catch (error) {
      console.error("Error in fetchChatMessages:", error);
      return [];
    }
  }, []);

  return {
    storeUserMessage,
    storeAIMessage,
    fetchChatMessages
  };
};
