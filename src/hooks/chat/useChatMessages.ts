
import { useCallback } from 'react';
import { nanoid } from 'nanoid';
import { Message } from '@/components/chat/types';
import { ChatMessage } from '@/utils/openai/types';
import { useAuth } from '@/context/AuthContext';
import { useSession } from './useSession';
import { useMessages } from './useMessages';
import { useChatSubscription } from './useChatSubscription';

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
  
  // Auto-save guest session when messages change
  useCallback(() => {
    if (!user && chatId && messages.length > 0) {
      saveGuestSession(chatId, messages, messageHistory);
    }
  }, [user, messages, messageHistory, chatId, saveGuestSession]);
  
  // Enhanced resetChat function that properly clears the chat and generates a new ID
  const resetChat = useCallback(() => {
    // In a complete implementation, we would save the messages to history here
    updateMessages([]);
    updateMessageHistory([]);
    const newChatId = nanoid();
    setChatId(newChatId);
    
    // If user is not logged in, clear the guest session
    if (!user) {
      // Assuming clearGuestSession exists in the parent component
      // clearGuestSession();
    }
  }, [user, updateMessages, updateMessageHistory, setChatId]);
  
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
