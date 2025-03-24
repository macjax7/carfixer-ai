
import { useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { Message } from '@/components/chat/types';

export const useSessionStorage = () => {
  const { user } = useAuth();

  // Create a chat session for a user message
  const createChatSession = useCallback(async (messageData: Message) => {
    if (!user) {
      console.log("Cannot create chat session: not authenticated");
      return null;
    }

    const newChatId = uuidv4();
    
    try {
      // Create a descriptive title based on the message content
      const title = messageData.text.length > 30 
        ? messageData.text.substring(0, 30) + '...' 
        : messageData.text;
        
      console.log("Creating new chat session with title:", title);
      
      const { error } = await supabase
        .from('chat_sessions')
        .insert({
          id: newChatId,
          user_id: user.id,
          title
        });
      
      if (error) {
        console.error('Error creating chat session:', error);
      } else {
        console.log('Successfully created chat session with ID:', newChatId);
      }
      
      return newChatId;
    } catch (error) {
      console.error('Error in createChatSession:', error);
      return newChatId; // Still return ID even if DB operation fails
    }
  }, [user]);

  // Fetch the last chat session
  const fetchLastChatSession = useCallback(async () => {
    if (!user) {
      console.log("Cannot fetch last chat session: not authenticated");
      return null;
    }
    
    try {
      console.log("Fetching last chat session for user:", user.email);
      
      const { data, error } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          // This error means no rows were returned, which is not an error for us
          console.log("No previous chat sessions found for user");
          return null;
        }
        console.error("Error loading chat session:", error);
        return null;
      }
      
      console.log("Found last session:", data?.id);
      return data || null;
    } catch (error) {
      console.error("Error in fetchLastChatSession:", error);
      return null;
    }
  }, [user]);

  // Update chat session title
  const updateSessionTitle = useCallback(async (chatId: string, title: string) => {
    if (!user || !chatId) {
      console.log("Cannot update session title: missing user or chatId");
      return;
    }
    
    try {
      console.log("Updating chat session title:", title);
      
      const { error } = await supabase
        .from('chat_sessions')
        .update({ title })
        .eq('id', chatId);
        
      if (error) {
        console.error("Error updating chat session title:", error);
      } else {
        console.log("Successfully updated chat session title");
      }
    } catch (error) {
      console.error("Error in updateSessionTitle:", error);
    }
  }, [user]);

  return {
    createChatSession,
    fetchLastChatSession,
    updateSessionTitle
  };
};
