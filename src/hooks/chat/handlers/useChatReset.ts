
import { useCallback } from "react";
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useChatId } from "./useChatId";

export const useChatReset = (user: any | null, setChatId: (id: string | null) => void) => {
  const { generateChatId } = useChatId();
  
  // Reset chat
  const resetChat = useCallback(async () => {
    // For logged-in users, create a new chat session
    if (user) {
      try {
        // Create a new chat session
        const newId = generateChatId(true);
        const { error } = await supabase
          .from('chat_sessions')
          .insert({
            id: newId,
            user_id: user.id,
            title: 'New Chat'
          });
          
        if (error) throw error;
        
        console.log("Created new chat session:", newId);
        setChatId(newId);
        return newId;
      } catch (error) {
        console.error("Error creating new chat session:", error);
        
        // Fallback to local ID
        const fallbackId = generateChatId(true);
        setChatId(fallbackId);
        return fallbackId;
      }
    } else {
      // For guests, just generate a new local ID
      const guestId = generateChatId(false);
      setChatId(guestId);
      return guestId;
    }
  }, [user, generateChatId, setChatId]);

  return {
    resetChat
  };
};
