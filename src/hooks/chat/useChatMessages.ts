
import { useCallback, useEffect } from 'react';
import { nanoid } from 'nanoid';
import { Message } from '@/components/chat/types';
import { useAuth } from '@/context/AuthContext';
import { useGuestSession } from './useGuestSession';
import { useRealTimeMessages } from './useRealTimeMessages';
import { useMessageState } from './useMessageState';
import { useChatState } from './useChatState';
import { useChatInitialization } from './useChatInitialization';

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
  
  // Initialize chat based on user status and existing sessions
  useChatInitialization(
    isLoaded,
    hasGuestSession,
    loadGuestSession,
    generateGuestChatId,
    setIsLoading,
    updateChatId,
    updateAllMessages,
    updateMessageHistory
  );
  
  // Set up real-time subscription with stable callbacks
  useRealTimeMessages(
    chatId,
    addMessage,
    updateMessageHistory
  );
  
  // Save guest session when messages change
  useEffect(() => {
    if (!user && chatId && messages.length > 0) {
      saveGuestSession(chatId, messages, messageHistory);
    }
  }, [chatId, messages, messageHistory, saveGuestSession, user]);
  
  // User message handling with deduplication
  const addUserMessage = useCallback((messageData: Message) => {
    console.log("Adding user message:", messageData);
    
    // Skip if already processed
    if (processedMessageIdsRef.current.has(messageData.id)) {
      return messageData;
    }
    
    // Add message (will handle updating processedMessageIdsRef)
    addMessage(messageData);
    
    return messageData;
  }, [addMessage, processedMessageIdsRef]);
  
  // AI message handling with deduplication
  const addAIMessage = useCallback((messageData: Message) => {
    console.log("Adding AI message:", messageData);
    
    // Skip if already processed  
    if (processedMessageIdsRef.current.has(messageData.id)) {
      return messageData;
    }
    
    // Add message (will handle updating processedMessageIdsRef)
    addMessage(messageData);
    
    return messageData;
  }, [addMessage, processedMessageIdsRef]);
  
  // Reset chat state and generate new ID
  const resetChat = useCallback(() => {
    console.log("Resetting chat");
    
    // Clear messages and history
    resetMessages();
    
    // Generate new chat ID
    const newId = generateNewChatId();
    
    return newId;
  }, [resetMessages, generateNewChatId]);
  
  // Load existing chat by ID
  const loadChatById = useCallback(async (id: string) => {
    if (id === chatIdLoaded) return;
    
    setIsLoading(true);
    console.log("Loading chat by ID:", id);
    
    try {
      // Set chat ID first
      updateChatId(id);
      
      // Clear existing messages - they will be loaded via real-time subscription
      resetMessages();
    } catch (error) {
      console.error("Error loading chat by ID:", error);
    } finally {
      setIsLoading(false);
    }
  }, [chatIdLoaded, setIsLoading, updateChatId, resetMessages]);
  
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
    chatIdLoaded
  };
};
