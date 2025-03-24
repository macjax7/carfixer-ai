
import { useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Message } from '@/components/chat/types';
import { useAuth } from '@/context/AuthContext';

export const useRealTimeMessages = (
  chatId: string | null,
  addMessage: (message: Message) => void,
  updateMessageHistory: (history: string[]) => void
) => {
  const { user } = useAuth();
  const recentMessageTimestamps = useRef<Record<string, number>>({});
  
  // Set up real-time subscription when chat ID changes
  useEffect(() => {
    // No subscription needed for non-authenticated users or no chatId
    if (!user || !chatId) return;
    
    console.log("Setting up real-time messages subscription for chat ID:", chatId);
    
    // Subscribe to new chat messages
    const subscription = supabase
      .channel(`messages:${chatId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `session_id=eq.${chatId}`
        },
        (payload) => {
          const messageData = payload.new;
          
          if (!messageData) {
            console.warn("Received real-time message event with no data");
            return;
          }
          
          console.log("Received real-time message:", messageData);
          
          // Skip if this is a recent message from the same device
          const now = Date.now();
          const messageId = messageData.id;
          
          // Debounce messages by id to prevent duplicates
          if (messageId in recentMessageTimestamps.current) {
            const lastSeenTime = recentMessageTimestamps.current[messageId];
            if (now - lastSeenTime < 2000) { // 2 second debounce
              console.log("Skipping recent message:", messageId);
              return;
            }
          }
          
          // Record this message as recently seen
          recentMessageTimestamps.current[messageId] = now;
          
          // Clean up old entries in recentMessageTimestamps
          const cutoffTime = now - 5000; // 5 seconds
          Object.keys(recentMessageTimestamps.current).forEach(id => {
            if (recentMessageTimestamps.current[id] < cutoffTime) {
              delete recentMessageTimestamps.current[id];
            }
          });
          
          // Convert to Message format
          const message: Message = {
            id: messageData.id,
            sender: messageData.role === 'user' ? 'user' : 'ai',
            text: messageData.content,
            timestamp: new Date(messageData.created_at),
            image: messageData.image_url
          };
          
          // Add to UI
          console.log("Adding real-time message to UI:", message);
          addMessage(message);
          
          // Update message history if user message
          if (messageData.role === 'user') {
            updateMessageHistory([messageData.content]);
          }
        }
      )
      .subscribe();
    
    // Clean up subscription
    return () => {
      console.log("Cleaning up real-time messages subscription");
      supabase.removeChannel(subscription);
    };
  }, [chatId, user, addMessage, updateMessageHistory]);
};
