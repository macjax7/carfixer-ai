
import { useCallback, useEffect, useRef } from "react";
import { supabase } from '@/integrations/supabase/client';
import { Message } from "@/components/chat/types";

export const useRealtimeMessages = (
  chatId: string | null,
  onNewMessage: (message: Message) => void
) => {
  const processedMessagesRef = useRef<Set<string>>(new Set());
  
  // Set up real-time subscription for new messages
  useEffect(() => {
    if (!chatId) return;
    
    // Only set up subscription for valid UUIDs (for database operations)
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(chatId)) {
      console.log("Not setting up subscription for non-UUID chat ID:", chatId);
      return;
    }
    
    console.log("Setting up real-time subscription for chat:", chatId);
    
    const channel = supabase
      .channel(`chat:${chatId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
        filter: `session_id=eq.${chatId}`,
      }, (payload) => {
        console.log("Received real-time message:", payload);
        
        if (payload.new) {
          const { id, content, role, image_url, created_at } = payload.new;
          
          // Skip if already processed
          if (processedMessagesRef.current.has(id)) {
            console.log("Skipping already processed message:", id);
            return;
          }
          
          processedMessagesRef.current.add(id);
          
          // Add message to UI
          const newMessage: Message = {
            id,
            sender: role === 'user' ? 'user' : 'ai',
            text: content || '',
            timestamp: new Date(created_at),
            image: image_url
          };
          
          onNewMessage(newMessage);
        }
      })
      .subscribe((status) => {
        console.log("Subscription status:", status);
      });
      
    return () => {
      console.log("Cleaning up subscription");
      supabase.removeChannel(channel);
    };
  }, [chatId, onNewMessage]);

  // Helper to check if a message has been processed
  const hasProcessedMessage = useCallback((id: string): boolean => {
    return processedMessagesRef.current.has(id);
  }, []);

  // Mark a message as processed
  const markMessageProcessed = useCallback((id: string): void => {
    processedMessagesRef.current.add(id);
  }, []);

  return {
    hasProcessedMessage,
    markMessageProcessed
  };
};
