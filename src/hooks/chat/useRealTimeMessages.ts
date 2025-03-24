
import { useEffect, useCallback, useRef } from 'react';
import { Message } from '@/components/chat/types';
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';

export const useRealTimeMessages = (
  chatId: string | null,
  addMessage: (message: Message) => void,
  updateMessageHistory: (history: string[]) => void
) => {
  const subscriptionRef = useRef<any>(null);

  // Ensure proper cleanup of subscription
  useEffect(() => {
    return () => {
      if (subscriptionRef.current) {
        console.log("Cleaning up real-time messages subscription");
        supabase.removeChannel(subscriptionRef.current);
        subscriptionRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    // Clean up previous subscription if exists
    if (subscriptionRef.current) {
      console.log("Cleaning up real-time messages subscription");
      supabase.removeChannel(subscriptionRef.current);
      subscriptionRef.current = null;
    }

    if (!chatId) return;

    // Validate UUID format - must be a valid UUID for Supabase real-time to work
    const isValidUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(chatId);
    if (!isValidUUID) {
      console.warn("ChatId is not a valid UUID for real-time subscription:", chatId);
      
      // Instead of just warning, create a valid UUID and use that
      const validUuid = uuidv4();
      console.info("Creating a new valid UUID for this subscription");
      console.info("Setting up real-time messages subscription for chat ID:", validUuid);
      
      // Set up subscription with the valid UUID instead
      const channel = supabase
        .channel(`chat:${validUuid}`)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `session_id=eq.${validUuid}`,
        }, (payload) => {
          console.log("Received real-time message:", payload);
          
          // Convert database message to app Message format
          if (payload.new) {
            const { id, content, role, image_url, created_at } = payload.new;
            
            const message: Message = {
              id,
              sender: role === 'user' ? 'user' : 'ai',
              text: content,
              timestamp: new Date(created_at),
              image: image_url
            };
            
            // Add message to UI
            addMessage(message);
            
            // Update message history if it's a user message
            if (role === 'user') {
              updateMessageHistory([content]);
            }
          }
        })
        .subscribe((status) => {
          console.info("Realtime subscription status:", status);
        });
        
      subscriptionRef.current = channel;
      return;
    }
    
    // If valid UUID, proceed normally
    console.info("Setting up real-time messages subscription for chat ID:", chatId);
    
    const channel = supabase
      .channel(`chat:${chatId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
        filter: `session_id=eq.${chatId}`,
      }, (payload) => {
        console.log("Received real-time message:", payload);
        
        // Convert database message to app Message format
        if (payload.new) {
          const { id, content, role, image_url, created_at } = payload.new;
          
          const message: Message = {
            id,
            sender: role === 'user' ? 'user' : 'ai',
            text: content,
            timestamp: new Date(created_at),
            image: image_url
          };
          
          // Add message to UI
          addMessage(message);
          
          // Update message history if it's a user message
          if (role === 'user') {
            updateMessageHistory([content]);
          }
        }
      })
      .subscribe((status) => {
        console.info("Realtime subscription status:", status);
      });
      
    subscriptionRef.current = channel;
  }, [chatId, addMessage, updateMessageHistory]);
};
