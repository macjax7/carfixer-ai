
import { useCallback } from 'react';
import { Message } from '@/components/chat/types';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

export const useMessageStorage = () => {
  const { user } = useAuth();

  const storeUserMessage = useCallback(async (messageData: Message, sessionId: string) => {
    if (!user || !sessionId) return;

    try {
      console.log(`Storing user message to database:`, { message: messageData, sessionId });
      await supabase
        .from('chat_messages')
        .insert({
          id: messageData.id,
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
      await supabase
        .from('chat_messages')
        .insert({
          id: messageData.id,
          session_id: sessionId,
          role: 'assistant',
          content: messageData.text
        });
        
      console.log('Successfully stored AI message');
    } catch (error) {
      console.error("Error storing AI message:", error);
    }
  }, [user]);

  return {
    storeUserMessage,
    storeAIMessage
  };
};
