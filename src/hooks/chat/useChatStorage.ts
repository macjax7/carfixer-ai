
import { useCallback } from 'react';
import { Message } from '@/components/chat/types';
import { useMessageStorage } from './useMessageStorage';
import { useSessionStorage } from './useSessionStorage';

export const useChatStorage = (chatId: string | null, onMessagesLoaded: (messages: Message[]) => void) => {
  const { storeUserMessage, storeAIMessage, fetchChatMessages } = useMessageStorage();
  const { createChatSession, fetchLastChatSession } = useSessionStorage((id) => {
    // Properly handle the id to messages conversion
    fetchChatMessages(id).then(messages => {
      if (messages && messages.length > 0) {
        onMessagesLoaded(messages);
      }
    });
  });

  const loadChatMessages = useCallback(async () => {
    if (!chatId) return [];
    
    try {
      console.log("Loading chat messages for ID:", chatId);
      const messages = await fetchChatMessages(chatId);
      
      if (messages && messages.length > 0) {
        console.log(`Loaded ${messages.length} messages from storage`);
        onMessagesLoaded(messages);
      } else {
        console.log("No messages found in storage for chat ID:", chatId);
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
    loadChatMessages,
    createChatSession,
    fetchLastChatSession,
    fetchChatMessages
  };
};
