
import { useCallback } from 'react';
import { nanoid } from 'nanoid';
import { Message } from '@/components/chat/types';
import { ChatMessage } from '@/utils/openai/types';
import { useAuth } from '@/context/AuthContext';
import { useSession } from './useSession';
import { useMessages } from './useMessages';
import { useChatSubscription } from './useChatSubscription';
import { useMessageSync } from './useMessageSync';
import { useChatReset } from './useChatReset';

export const useChatMessages = () => {
  const { user } = useAuth();
  const {
    chatId,
    setChatId,
    isLoading,
    loadChatById,
    saveGuestSession
  } = useSession();

  const {
    messages,
    messageHistory,
    addUserMessage,
    addAIMessage,
    getMessagesForAPI,
    addMessage,
    updateMessages,
    updateMessageHistory
  } = useMessages(chatId);
  
  // Set up subscription to real-time updates
  useChatSubscription({
    chatId,
    setMessages: updateMessages,
    setMessageHistory: updateMessageHistory
  });
  
  // Set up message syncing for guest sessions
  useMessageSync(chatId, messages, messageHistory, saveGuestSession);
  
  // Set up chat reset functionality
  const { resetChat } = useChatReset(updateMessages, updateMessageHistory, setChatId, user);
  
  return {
    messages,
    messageHistory,
    chatId,
    isLoading,
    addUserMessage,
    addAIMessage,
    getMessagesForAPI,
    resetChat,
    addMessage,
    setChatId,
    loadChatById,
    chatIdLoaded: chatId
  };
};
