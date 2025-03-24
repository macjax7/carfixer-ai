
import { useCallback } from "react";
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useChatId } from "./useChatId";

export const useChatInitialization = (user: any | null, setChatId: (id: string | null) => void) => {
  const { toast } = useToast();
  const { generateChatId } = useChatId();
  
  // Initialize or retrieve chat session
  const initializeChat = useCallback(async () => {
    // For logged-in users, try to find an existing session or create a new one
    if (user) {
      try {
        // Try to find the most recent chat
        const { data, error } = await supabase
          .from('chat_sessions')
          .select('*')
          .eq('user_id', user.id)
          .order('updated_at', { ascending: false })
          .limit(1);
          
        if (error) throw error;
        
        if (data && data.length > 0) {
          console.log("Found existing chat session:", data[0].id);
          setChatId(data[0].id);
          
          return data[0].id;
        } else {
          // Create a new chat session
          const newId = generateChatId(true);
          const { error: insertError } = await supabase
            .from('chat_sessions')
            .insert({
              id: newId,
              user_id: user.id,
              title: 'New Chat'
            });
            
          if (insertError) throw insertError;
          
          console.log("Created new chat session:", newId);
          setChatId(newId);
          return newId;
        }
      } catch (error) {
        console.error("Error initializing chat:", error);
        toast({
          title: "Error initializing chat",
          description: "Failed to set up chat session",
          variant: "destructive"
        });
        
        // Fallback to local ID
        const fallbackId = generateChatId(true);
        setChatId(fallbackId);
        return fallbackId;
      }
    } else {
      // For guests, just generate a local ID
      const guestId = generateChatId(false);
      setChatId(guestId);
      return guestId;
    }
  }, [user, toast, generateChatId, setChatId]);

  return {
    initializeChat
  };
};
