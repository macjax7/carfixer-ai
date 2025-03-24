import { useEffect, useRef } from 'react';
import { Message } from '@/components/chat/types';
import { supabase } from '@/integrations/supabase/client';

export const useRealTimeMessages = (
  chatId: string | null,
  addMessage: (message: Message) => void,
  updateMessageHistory: (newHistory: string[]) => void
) => {
  // Keep track of subscription with a ref to avoid cleanup issues
  const subscriptionRef = useRef<any>(null);
  
  // Set up real-time subscription to chat messages
  useEffect(() => {
    if (!chatId) return;

    console.log("Setting up real-time subscription for chat ID:", chatId);
    
    // Clean up any existing subscription first
    if (subscriptionRef.current) {
      console.log("Cleaning up existing subscription before creating new one");
      supabase.removeChannel(subscriptionRef.current);
      subscriptionRef.current = null;
    }
    
    const setupSubscription = async () => {
      const channel = supabase
        .channel(`chat-messages-${chatId}`) // Use unique channel name to avoid conflicts
        .on('postgres_changes', 
          { 
            event: 'INSERT', 
            schema: 'public', 
            table: 'chat_messages',
            filter: `session_id=eq.${chatId}`
          }, 
          (payload) => {
            console.log("Received real-time message update:", payload);
            
            // Only update if the message is for the current chat session
            if (payload.new && payload.new.session_id === chatId) {
              // Ensure timestamp is always a proper Date object
              const timestamp = new Date(payload.new.created_at);
              
              const newMsg: Message = {
                id: payload.new.id,
                sender: payload.new.role === 'user' ? 'user' : 'ai',
                text: payload.new.content,
                timestamp: timestamp,
                image: payload.new.image_url
              };
              
              console.log("Adding new message to UI from real-time update:", newMsg);
              
              addMessage(newMsg);
              
              if (payload.new.role === 'user') {
                // Update message history with the new user message
                updateMessageHistory([payload.new.content]);
              }
            }
          }
        )
        .subscribe((status) => {
          console.log("Supabase channel subscription status:", status);
        });
      
      subscriptionRef.current = channel;
      return channel;
    };
    
    setupSubscription();
    
    return () => {
      // Clean up subscription
      if (subscriptionRef.current) {
        console.log("Cleaning up Supabase channel subscription");
        supabase.removeChannel(subscriptionRef.current);
        subscriptionRef.current = null;
      }
    };
  }, [chatId, addMessage, updateMessageHistory]);
};
