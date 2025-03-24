
import { useCallback } from 'react';
import { Message } from '@/components/chat/types';
import { useAuth } from '@/context/AuthContext';
import { useChatStorage } from './useChatStorage';

export const useMessageAddHandler = (
  chatId: string | null,
  addMessage: (message: Message) => void,
  processedMessageIdsRef: React.MutableRefObject<Set<string>>
) => {
  const { user } = useAuth();
  const { storeUserMessage, storeAIMessage } = useChatStorage(chatId, () => {});

  // User message handling with deduplication
  const addUserMessage = useCallback((messageData: Message) => {
    console.log("Adding user message:", messageData);
    
    // Skip if already processed
    if (processedMessageIdsRef.current.has(messageData.id)) {
      return messageData;
    }
    
    // Add message (will handle updating processedMessageIdsRef)
    addMessage(messageData);
    
    // Store the message in the database if user is logged in
    if (chatId && user) {
      storeUserMessage(messageData, chatId);
    }
    
    return messageData;
  }, [addMessage, processedMessageIdsRef, chatId, user, storeUserMessage]);
  
  // AI message handling with deduplication
  const addAIMessage = useCallback((messageData: Message) => {
    console.log("Adding AI message:", messageData);
    
    // Skip if already processed  
    if (processedMessageIdsRef.current.has(messageData.id)) {
      return messageData;
    }
    
    // Add message (will handle updating processedMessageIdsRef)
    addMessage(messageData);
    
    // Store AI response in the database if user is logged in
    if (chatId && user) {
      storeAIMessage(messageData, chatId);
    }
    
    return messageData;
  }, [addMessage, processedMessageIdsRef, chatId, user, storeAIMessage]);

  return {
    addUserMessage,
    addAIMessage
  };
};
