
import { useEffect, useCallback } from 'react';
import { Message } from '@/components/chat/types';
import { supabase } from '@/integrations/supabase/client';

export const useRealTimeMessages = (
  chatId: string | null,
  addMessage: (message: Message) => void,
  updateMessageHistory: (newHistory: string[]) => void
) => {
  // Set up real-time subscription to chat messages
  useEffect(() => {
    if (!chatId) return;

    console.log("Setting up real-time subscription for chat ID:", chatId);

    const setupMessageSubscription = async () => {
      const { data: session } = await supabase.auth.getSession();
      
      console.log("Creating channel subscription for chat messages...");
      
      const subscription = supabase
        .channel('chat-messages-changes')
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
                updateMessageHistory(prev => [...prev, payload.new.content]);
              }
            }
          }
        )
        .subscribe((status) => {
          console.log("Supabase channel subscription status:", status);
        });
        
      return subscription;
    };
    
    const subscriptionPromise = setupMessageSubscription();
    
    return () => {
      // Clean up subscription
      subscriptionPromise.then(sub => {
        if (sub) {
          console.log("Cleaning up Supabase channel subscription");
          supabase.removeChannel(sub);
        }
      });
    };
  }, [chatId, addMessage, updateMessageHistory]);
};
