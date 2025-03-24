
import { useEffect, useCallback, useRef } from 'react';
import { Message } from '@/components/chat/types';
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import { useToast } from '@/hooks/use-toast';

export const useRealTimeMessages = (
  chatId: string | null,
  addMessage: (message: Message) => void,
  updateMessageHistory: (history: string[]) => void
) => {
  const subscriptionRef = useRef<any>(null);
  const { toast } = useToast();

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
      console.log("Cleaning up previous real-time messages subscription");
      supabase.removeChannel(subscriptionRef.current);
      subscriptionRef.current = null;
    }

    if (!chatId) {
      console.log("No chatId provided for real-time subscription");
      return;
    }

    // Validate UUID format - must be a valid UUID for Supabase real-time to work
    const isValidUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(chatId);
    if (!isValidUUID) {
      console.warn("ChatId is not a valid UUID for real-time subscription:", chatId);
      
      // Try to create a valid UUID but only log the warning - don't change the active chatId
      const validUuid = uuidv4();
      console.info("A valid UUID would be:", validUuid);
      console.info("Not setting up real-time subscription due to invalid UUID");
      return;
    }
    
    console.info("Setting up real-time messages subscription for chat ID:", chatId);
    
    try {
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
            
            // Validate data
            if (!id || !role || content === undefined) {
              console.error("Invalid message data from real-time event:", payload.new);
              return;
            }
            
            const message: Message = {
              id,
              sender: role === 'user' ? 'user' : 'ai',
              text: content || '',
              timestamp: new Date(created_at),
              image: image_url
            };
            
            console.log("Adding message from real-time subscription:", 
              message.id, message.sender, message.text.substring(0, 50) + "...");
            
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
          
          if (status === 'SUBSCRIBED') {
            console.log("Successfully subscribed to real-time updates for chat:", chatId);
          } else if (status === 'CHANNEL_ERROR') {
            console.error("Error subscribing to real-time updates");
            toast({
              title: "Connection Error",
              description: "Failed to connect to real-time updates",
              variant: "destructive"
            });
          }
        });
        
      subscriptionRef.current = channel;
      console.log("Real-time subscription channel initialized");
    } catch (error) {
      console.error("Error setting up real-time subscription:", error);
      toast({
        title: "Connection Error",
        description: "Failed to connect to real-time updates",
        variant: "destructive"
      });
    }
  }, [chatId, addMessage, updateMessageHistory, toast]);
};
