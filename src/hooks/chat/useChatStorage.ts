
import { useCallback } from 'react';
import { Message } from '@/components/chat/types';
import { useMessageStorage } from './useMessageStorage';
import { useSessionStorage } from './useSessionStorage';

export const useChatStorage = (chatId: string | null, onMessagesLoaded: (messages: Message[]) => void) => {
  const { storeUserMessage, storeAIMessage, fetchChatMessages } = useMessageStorage();
  const { createChatSession, fetchLastChatSession } = useSessionStorage();

  // Load messages for current chat
  const loadChatMessages = useCallback(async () => {
    if (!chatId) {
      console.log("Cannot load chat messages: no chatId");
      return [];
    }
    
    try {
      console.log("Loading chat messages for ID:", chatId);
      const messages = await fetchChatMessages(chatId);
      
      if (messages && messages.length > 0) {
        console.log(`Loaded ${messages.length} messages`);
        onMessagesLoaded(messages);
      } else {
        console.log("No messages found for chat ID:", chatId);
      }
      
      return messages;
    } catch (error) {
      console.error("Error loading chat messages:", error);
      return [];
    }
  }, [chatId, fetchChatMessages, onMessagesLoaded]);

  return {
    storeUserMessage,
    storeAIMessage,
    createChatSession,
    loadChatMessages,
    fetchChatMessages,
    fetchLastChatSession
  };
};
