
import { useEffect, useRef, useState } from 'react';
import { Message } from '@/components/chat/types';
import { supabase } from '@/integrations/supabase/client';

export const useRealTimeMessages = (
  chatId: string | null,
  addMessage: (message: Message) => void,
  updateMessageHistory: (newHistory: string[]) => void
) => {
  // Keep track of subscription with a ref to avoid cleanup issues
  const subscriptionRef = useRef<any>(null);
  const processedMessageIds = useRef<Set<string>>(new Set());
  const messageQueueRef = useRef<Message[]>([]);
  const processingRef = useRef<boolean>(false);
  
  // Process message queue with debouncing to prevent UI flickering
  const processMessageQueue = () => {
    if (processingRef.current || messageQueueRef.current.length === 0) return;
    
    processingRef.current = true;
    
    // Use setTimeout to ensure React has time to complete any ongoing renders
    setTimeout(() => {
      const queue = [...messageQueueRef.current];
      messageQueueRef.current = [];
      
      // Process messages in batches to reduce render cycles
      queue.forEach(message => {
        // Skip if we've already processed this message
        if (processedMessageIds.current.has(message.id)) {
          return;
        }
        
        // Add to processed set to prevent duplicate processing
        processedMessageIds.current.add(message.id);
        
        // Add message
        addMessage(message);
        
        // Update message history if it's a user message
        if (message.sender === 'user') {
          updateMessageHistory([message.text]);
        }
      });
      
      processingRef.current = false;
      
      // Check if more messages arrived during processing
      if (messageQueueRef.current.length > 0) {
        processMessageQueue();
      }
    }, 50); // Small delay to batch updates
  };
  
  // Add message to queue
  const queueMessage = (message: Message) => {
    // Skip if very recent message (< 500ms) to prevent race conditions with local messages
    const now = Date.now();
    const messageTime = message.timestamp instanceof Date ? message.timestamp.getTime() : now;
    const isTooRecent = now - messageTime < 500;
    
    // If the message is from the user and very recent, it's likely a local message
    // We'll skip it as the local state already has it
    if (message.sender === 'user' && isTooRecent) {
      return;
    }
    
    // Add to queue
    messageQueueRef.current.push(message);
    
    // Start processing if not already processing
    if (!processingRef.current) {
      processMessageQueue();
    }
  };
  
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
    
    // Reset processed message IDs when chat ID changes
    processedMessageIds.current = new Set();
    messageQueueRef.current = [];
    processingRef.current = false;
    
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
            
            if (!payload.new || !payload.new.id) {
              console.warn("Received invalid message payload:", payload);
              return;
            }
            
            // Skip processing if we've already seen this message ID
            if (processedMessageIds.current.has(payload.new.id)) {
              console.log("Skipping already processed message:", payload.new.id);
              return;
            }
            
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
              
              console.log("Queueing new message from real-time update:", newMsg);
              
              // Queue the message for processing
              queueMessage(newMsg);
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
      // Clean up subscription and processed message IDs
      if (subscriptionRef.current) {
        console.log("Cleaning up Supabase channel subscription");
        supabase.removeChannel(subscriptionRef.current);
        subscriptionRef.current = null;
        processedMessageIds.current.clear();
        messageQueueRef.current = [];
        processingRef.current = false;
      }
    };
  }, [chatId, addMessage, updateMessageHistory]);
};
