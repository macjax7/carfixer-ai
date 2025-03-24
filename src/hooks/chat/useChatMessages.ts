
import { useCallback } from 'react';
import { Message } from '@/components/chat/types';
import { useAuth } from '@/context/AuthContext';
import { useGuestSession } from './useGuestSession';
import { useRealTimeMessages } from './useRealTimeMessages';
import { useMessageState } from './useMessageState';
import { useChatState } from './useChatState';
import { useSessionInitialization } from './useSessionInitialization';
import { useMessageAddHandler } from './useMessageAddHandler';
import { useChatOperations } from './useChatOperations';
import { useChatLoader } from './handlers/useChatLoader';

export const useChatMessages = () => {
  const { user } = useAuth();
  
  // Get session management hooks
  const { 
    loadGuestSession,
    saveGuestSession,
    hasGuestSession,
    generateGuestChatId,
    isLoaded
  } = useGuestSession();
  
  // Use more focused state hooks
  const {
    messages,
    messageHistory,
    addMessage,
    resetMessages,
    updateAllMessages,
    updateMessageHistory,
    processedMessageIdsRef
  } = useMessageState();
  
  const {
    chatId,
    chatIdLoaded,
    isLoading,
    setIsLoading,
    setChatId,
    setChatIdLoaded,
    updateChatId,
    generateNewChatId
  } = useChatState();

  // Get the chat loader
  const { loadChatById: loadChatByIdHandler } = useChatLoader();
  
  // Initialize chat based on user status and existing sessions
  useSessionInitialization(
    chatId,
    isLoaded,
    hasGuestSession,
    loadGuestSession,
    generateGuestChatId,
    updateChatId,
    updateAllMessages,
    updateMessageHistory,
    saveGuestSession,
    messages,
    messageHistory
  );
  
  // Set up real-time subscription with stable callbacks
  useRealTimeMessages(
    chatId,
    addMessage,
    updateMessageHistory
  );
  
  // Message handlers with deduplication
  const {
    addUserMessage,
    addAIMessage
  } = useMessageAddHandler(chatId, addMessage, processedMessageIdsRef);
  
  // Chat operations (reset, load, format for API)
  const {
    resetChat,
    loadChatById,
    getMessagesForAPI
  } = useChatOperations(
    messages, 
    resetMessages, 
    generateNewChatId, 
    loadChatByIdHandler, 
    setChatId, 
    setMessages
  );
  
  return {
    messages,
    messageHistory,
    chatId,
    isLoading,
    addUserMessage,
    addAIMessage,
    resetChat,
    setChatId,
    loadChatById,
    chatIdLoaded,
    getMessagesForAPI,
    addMessage,
    updateAllMessages,
    updateMessageHistory
  };
};
