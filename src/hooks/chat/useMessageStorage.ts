
import { useCallback } from 'react';
import { Message } from '@/components/chat/types';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

export const useMessageStorage = () => {
  const { user } = useAuth();

  const storeUserMessage = useCallback(async (messageData: Message, sessionId: string) => {
    if (!user || !sessionId) return;

    try {
      await supabase
        .from('chat_messages')
        .insert({
          id: messageData.id,
          session_id: sessionId,
          role: 'user',
          content: messageData.text,
          image_url: messageData.image
        });
    } catch (error) {
      console.error("Error storing user message:", error);
    }
  }, [user]);

  const storeAIMessage = useCallback(async (messageData: Message, sessionId: string) => {
    if (!user || !sessionId) return;

    try {
      await supabase
        .from('chat_messages')
        .insert({
          id: messageData.id,
          session_id: sessionId,
          role: 'assistant',
          content: messageData.text
        });
    } catch (error) {
      console.error("Error storing AI message:", error);
    }
  }, [user]);

  const fetchChatMessages = useCallback(async (sessionId: string) => {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });
      
      if (error) {
        console.error("Error loading chat messages:", error);
        return [];
      }
      
      return data || [];
    } catch (error) {
      console.error("Error fetching chat messages:", error);
      return [];
    }
  }, []);

  return {
    storeUserMessage,
    storeAIMessage,
    fetchChatMessages
  };
};
