
import { useEffect, useCallback } from 'react';
import { Message } from '@/components/chat/types';
import { supabase } from '@/integrations/supabase/client';

export const useChatSubscription = (
  chatId: string | null, 
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
  setMessageHistory: React.Dispatch<React.SetStateAction<string[]>>
) => {
  useEffect(() => {
    if (!chatId) return;

    const setupMessageSubscription = async () => {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session?.user) return null;
      
      const subscription = supabase
        .channel('chat-messages-changes')
        .on('postgres_changes', 
          { 
            event: 'INSERT', 
            schema: 'public', 
            table: 'chat_messages',
          }, 
          (payload) => {
            // Only update if the message is for the current chat session
            if (payload.new && payload.new.session_id === chatId) {
              const newMsg = {
                id: payload.new.id,
                sender: payload.new.role === 'user' ? 'user' as const : 'ai' as const,
                text: payload.new.content,
                timestamp: new Date(payload.new.created_at),
                image: payload.new.image_url
              };
              
              setMessages(prevMessages => {
                // Check if the message is already in the array to avoid duplicates
                if (!prevMessages.some(msg => msg.id === newMsg.id)) {
                  return [...prevMessages, newMsg];
                }
                return prevMessages;
              });
              
              if (payload.new.role === 'user') {
                setMessageHistory(prev => [...prev, payload.new.content]);
              }
            }
          }
        )
        .subscribe();
        
      return subscription;
    };
    
    const subscriptionPromise = setupMessageSubscription();
    
    return () => {
      // Clean up subscription
      subscriptionPromise.then(sub => {
        if (sub) {
          supabase.removeChannel(sub);
        }
      });
    };
  }, [chatId, setMessages, setMessageHistory]);
};
