
import { useCallback } from "react";
import { supabase } from '@/integrations/supabase/client';
import { Message } from "@/components/chat/types";

export const useMessageLoading = () => {
  // Load messages for a specific chat
  const loadMessages = useCallback(async (chatId: string): Promise<Message[]> => {
    if (!chatId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(chatId)) {
      console.log("Cannot load messages: invalid chat ID format", chatId);
      return [];
    }
    
    try {
      console.log("Loading messages for chat:", chatId);
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('session_id', chatId)
        .order('created_at', { ascending: true });
        
      if (error) throw error;
      
      if (data && data.length > 0) {
        const formattedMessages: Message[] = data.map(msg => ({
          id: msg.id,
          sender: msg.role === 'user' ? 'user' : 'ai',
          text: msg.content,
          timestamp: new Date(msg.created_at),
          image: msg.image_url
        }));
        
        console.log(`Loaded ${formattedMessages.length} messages for chat ${chatId}`);
        return formattedMessages;
      }
      
      return [];
    } catch (error) {
      console.error("Error loading messages:", error);
      return [];
    }
  }, []);

  return {
    loadMessages
  };
};
