
import { useEffect } from 'react';
import { Message } from '@/components/chat/types';
import { supabase } from '@/integrations/supabase/client';
import { ChatSubscriptionProps } from './types';

export const useChatSubscription = ({
  chatId,
  setMessages,
  setMessageHistory
}: ChatSubscriptionProps) => {
  useEffect(() => {
    if (!chatId) return;

    console.log("Setting up real-time subscription for chat ID:", chatId);

    const setupMessageSubscription = async () => {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session?.user) {
        console.log("No authenticated user session found for real-time updates");
        return null;
      }
      
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
              const newMsg: Message = {
                id: payload.new.id,
                sender: payload.new.role === 'user' ? 'user' : 'ai',
                text: payload.new.content,
                timestamp: new Date(payload.new.created_at),
                image: payload.new.image_url
              };
              
              console.log("Adding new message to UI from real-time update:", newMsg);
              
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
  }, [chatId, setMessages, setMessageHistory]);
};

export default useChatSubscription;
