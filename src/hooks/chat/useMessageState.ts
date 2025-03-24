
import { useState, useCallback, useRef } from 'react';
import { Message } from '@/components/chat/types';

export const useMessageState = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageHistory, setMessageHistory] = useState<string[]>([]);
  const processedMessageIdsRef = useRef<Set<string>>(new Set());
  
  // Add a new message with deduplication
  const addMessage = useCallback((message: Message) => {
    // Skip if already processed
    if (processedMessageIdsRef.current.has(message.id)) {
      console.log("Skipping duplicate message:", message.id);
      return;
    }
    
    // Add to processed set to prevent duplicates
    processedMessageIdsRef.current.add(message.id);
    
    setMessages(prevMessages => {
      // Double-check it's not already in the array
      if (prevMessages.some(m => m.id === message.id)) {
        console.log("Message already exists in array:", message.id);
        return prevMessages;
      }
      
      console.log("Adding new message:", message.id, message.sender, message.text.substring(0, 50) + "...");
      return [...prevMessages, message];
    });
    
    // If user message, add to history
    if (message.sender === 'user') {
      setMessageHistory(prev => [...prev, message.text]);
    }
  }, []);
  
  // Reset messages
  const resetMessages = useCallback(() => {
    console.log("Resetting all messages");
    setMessages([]);
    setMessageHistory([]);
    processedMessageIdsRef.current.clear();
  }, []);
  
  // Update all messages
  const updateAllMessages = useCallback((newMessages: Message[]) => {
    console.log(`Updating all messages with ${newMessages.length} messages`);
    
    // Reset the processed set
    processedMessageIdsRef.current.clear();
    
    // Add all new message IDs to processed set
    newMessages.forEach(msg => {
      processedMessageIdsRef.current.add(msg.id);
    });
    
    setMessages(newMessages);
  }, []);
  
  // Update message history
  const updateMessageHistory = useCallback((history: string[]) => {
    console.log(`Updating message history with ${history.length} items`);
    setMessageHistory(history);
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
