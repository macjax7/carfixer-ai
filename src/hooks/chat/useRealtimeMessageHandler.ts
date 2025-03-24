
import { useState, useCallback, useRef } from "react";
import { Message } from "@/components/chat/types";

export const useRealtimeMessageHandler = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const processedMessageIdsRef = useRef<Set<string>>(new Set());
  
  // Add new message to state with deduplication
  const addMessage = useCallback((message: Message) => {
    // Skip if already processed
    if (processedMessageIdsRef.current.has(message.id)) {
      console.log("Skipping already processed message:", message.id);
      return;
    }
    
    // Mark as processed and add to state
    processedMessageIdsRef.current.add(message.id);
    setMessages(prev => [...prev, message]);
  }, []);
  
  // Check if message has been processed
  const hasProcessedMessage = useCallback((id: string) => {
    return processedMessageIdsRef.current.has(id);
  }, []);
  
  // Mark message as processed without adding it
  const markMessageProcessed = useCallback((id: string) => {
    processedMessageIdsRef.current.add(id);
  }, []);
  
  return {
    messages,
    setMessages,
    addMessage,
    hasProcessedMessage,
    markMessageProcessed
  };
};
