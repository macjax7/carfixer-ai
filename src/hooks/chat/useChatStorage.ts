
import { useCallback } from 'react';
import { nanoid } from 'nanoid';
import { Message } from '@/components/chat/types';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { ChatStorageOperations } from './types';

export const useChatStorage = (
  chatId: string | null,
  setChatId: (id: string) => void
): ChatStorageOperations => {
  const { user } = useAuth();

  const createChatSession = useCallback(async (message: Message) => {
    if (!user) return;

    const newChatId = nanoid();
    setChatId(newChatId);

    try {
      await supabase
        .from('chat_sessions')
        .insert({
          id: newChatId,
          user_id: user.id,
          title: message.text.substring(0, 30) + (message.text.length > 30 ? '...' : '')
        });
      
      return newChatId;
    } catch (error) {
      console.error('Error creating chat session:', error);
      return newChatId; // Still return ID even if DB operation fails
    }
  }, [user, setChatId]);

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

  const fetchLastChatSession = useCallback(async () => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session?.user) return null;
      
      const { data, error } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('user_id', session.session.user.id)
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        console.error("Error loading chat session:", error);
        return null;
      }
      
      return data || null;
    } catch (error) {
      console.error("Error fetching last chat session:", error);
      return null;
    }
  }, []);

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
    createChatSession,
    storeUserMessage,
    storeAIMessage,
    fetchLastChatSession,
    fetchChatMessages
  };
};
