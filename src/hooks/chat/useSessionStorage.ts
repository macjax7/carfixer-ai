
import { useCallback } from 'react';
import { nanoid } from 'nanoid';
import { Message } from '@/components/chat/types';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

export const useSessionStorage = (setChatId: (id: string) => void) => {
  const { user } = useAuth();

  const createChatSession = useCallback(async (message: Message) => {
    if (!user) return;

    const newChatId = nanoid();
    setChatId(newChatId);

    try {
      // Create a descriptive title based on the message content
      const title = message.text.length > 30 
        ? message.text.substring(0, 30) + '...' 
        : message.text;
        
      await supabase
        .from('chat_sessions')
        .insert({
          id: newChatId,
          user_id: user.id,
          title
        });
      
      return newChatId;
    } catch (error) {
      console.error('Error creating chat session:', error);
      return newChatId; // Still return ID even if DB operation fails
    }
  }, [user, setChatId]);

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

  return {
    createChatSession,
    fetchLastChatSession,
  };
};
