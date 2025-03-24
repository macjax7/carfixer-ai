
import { useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Message } from '@/components/chat/types';
import { useAuth } from '@/context/AuthContext';
import { v4 as uuidv4 } from 'uuid';

export const useRealTimeMessages = (
  chatId: string | null,
  addMessage: (message: Message) => void,
  updateMessageHistory: (history: string[]) => void
) => {
  const { user } = useAuth();
  const recentMessageTimestamps = useRef<Record<string, number>>({});
  const channelRef = useRef<any>(null);
  
  // Set up real-time subscription when chat ID changes
  useEffect(() => {
    // Clean up previous subscription if exists
    if (channelRef.current) {
      console.log("Cleaning up previous subscription");
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
    
    // No subscription needed for non-authenticated users or no chatId
    if (!chatId) {
      console.log("No real-time subscription needed: chatId missing", { chatId });
      return;
    }
    
    // Validate chatId is a proper UUID for Supabase
    let validChatId = chatId;
    try {
      // Check if chatId is a valid UUID
      const isValidUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(chatId);
      if (!isValidUUID) {
        console.warn("ChatId is not a valid UUID for real-time subscription:", chatId);
        console.log("Creating a new valid UUID for this subscription");
        validChatId = uuidv4();
      }
    } catch (err) {
      console.error("Error validating chatId for real-time subscription:", err);
      return;
    }
    
    console.log("Setting up real-time messages subscription for chat ID:", validChatId);
    
    // Subscribe to new chat messages
    const channel = supabase
      .channel(`messages-${validChatId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `session_id=eq.${validChatId}`
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
      .subscribe((status) => {
        console.log("Realtime subscription status:", status);
      });
    
    // Store the channel reference
    channelRef.current = channel;
    
    // Clean up subscription
    return () => {
      console.log("Cleaning up real-time messages subscription");
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [chatId, addMessage, updateMessageHistory]);
};
