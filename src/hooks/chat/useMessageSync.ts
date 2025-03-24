
import { useCallback, useEffect } from 'react';
import { Message } from '@/components/chat/types';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';

export const useMessageSync = (
  chatId: string | null,
  messages: Message[],
  messageHistory: string[],
  saveGuestSession: (chatId: string, messages: Message[], messageHistory: string[]) => void
) => {
  const { user } = useAuth();
  
  // Fetch messages from database for authenticated users
  useEffect(() => {
    const fetchExistingMessages = async () => {
      if (user && chatId && messages.length === 0) {
        console.log("Fetching existing messages for user:", user.id, "chat:", chatId);
        
        // Validate chatId is a proper UUID for Supabase
        let validChatId = chatId;
        try {
          // Check if chatId is a valid UUID
          const uuid = uuidv4();
          const isValidUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(chatId);
          if (!isValidUUID) {
            console.warn("ChatId is not a valid UUID:", chatId);
            console.log("Creating a new valid UUID for this chat");
            validChatId = uuidv4();
          }
        } catch (err) {
          console.error("Error validating chatId:", err);
          return;
        }
        
        try {
          const { data, error } = await supabase
            .from('chat_messages')
            .select('*')
            .eq('session_id', validChatId)
            .order('created_at', { ascending: true });
            
          if (error) {
            console.error("Error fetching existing messages:", error);
            return;
          }
          
          console.log(`Found ${data.length} existing messages for chat:`, validChatId);
          
          // Process and update UI with fetched messages
          if (data.length > 0) {
            // This will be handled by the real-time subscription
            console.log("Messages will be loaded via real-time subscription");
          }
        } catch (err) {
          console.error("Error in fetchExistingMessages:", err);
        }
      }
    };
    
    fetchExistingMessages();
  }, [user, chatId, messages.length]);
  
  // Auto-save guest session when messages change
  const syncGuestMessages = useCallback(() => {
    if (!user && chatId && messages.length > 0) {
      saveGuestSession(chatId, messages, messageHistory);
    }
  }, [user, messages, messageHistory, chatId, saveGuestSession]);
  
  // Set up auto-sync effect
  useEffect(() => {
    syncGuestMessages();
  }, [syncGuestMessages]);
  
  return { syncGuestMessages };
};
