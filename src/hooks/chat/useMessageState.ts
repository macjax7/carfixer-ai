
import { useState, useCallback, useRef } from 'react';
import { Message } from '@/components/chat/types';

export const useMessageState = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageHistory, setMessageHistory] = useState<string[]>([]);
  const processedMessageIdsRef = useRef<Set<string>>(new Set());

  // Add a message with deduplication
  const addMessage = useCallback((message: Message) => {
    // Skip if already processed
    if (processedMessageIdsRef.current.has(message.id)) {
      return;
    }
    
    // Add to processed set
    processedMessageIdsRef.current.add(message.id);
    
    // Use functional update to prevent race conditions
    setMessages(prev => {
      // Double check to avoid duplicates
      if (prev.some(msg => msg.id === message.id)) {
        return prev;
      }
      return [...prev, message];
    });
    
    // Update history for user messages
    if (message.sender === 'user') {
      setMessageHistory(prev => [...prev, message.text]);
    }
  }, []);

  // Reset all message state
  const resetMessages = useCallback(() => {
    setMessages([]);
    setMessageHistory([]);
    processedMessageIdsRef.current.clear();
  }, []);

  // Update all messages at once (for loading from storage/db)
  const updateAllMessages = useCallback((newMessages: Message[]) => {
    // Clear existing processed IDs
    processedMessageIdsRef.current.clear();
    
    // Add all message IDs to processed set
    newMessages.forEach(msg => {
      processedMessageIdsRef.current.add(msg.id);
    });
    
    setMessages(newMessages);
  }, []);

  // Update message history from external source
  const updateMessageHistory = useCallback((newHistory: string[]) => {
    setMessageHistory(prev => [...prev, ...newHistory]);
  }, []);

  return {
    messages,
    messageHistory,
    addMessage,
    resetMessages,
    updateAllMessages,
    updateMessageHistory,
    processedMessageIdsRef
  };
};
