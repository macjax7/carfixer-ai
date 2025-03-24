
import { useState, useCallback, useEffect, useRef } from 'react';
import { nanoid } from 'nanoid';
import { Message } from '@/components/chat/types';
import { useAuth } from '@/context/AuthContext';
import { useGuestSession } from './useGuestSession';
import { useRealTimeMessages } from './useRealTimeMessages';

export const useChatMessages = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageHistory, setMessageHistory] = useState<string[]>([]);
  const [chatId, setChatId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [chatIdLoaded, setChatIdLoaded] = useState<string | null>(null);
  const processedMessageIdsRef = useRef<Set<string>>(new Set());
  
  const { user } = useAuth();
  const { 
    loadGuestSession,
    saveGuestSession,
    hasGuestSession,
    generateGuestChatId,
    isLoaded
  } = useGuestSession();
  
  // Initialize chat session
  useEffect(() => {
    if (!isLoaded) return;
    
    const initializeChat = () => {
      setIsLoading(true);
      
      // For guest users, try to load from localStorage
      if (!user) {
        if (hasGuestSession()) {
          const guestSession = loadGuestSession();
          if (guestSession) {
            console.log("Loaded guest session:", guestSession);
            setChatId(guestSession.chatId);
            setMessages(guestSession.messages);
            setMessageHistory(guestSession.messageHistory || []);
            setChatIdLoaded(guestSession.chatId);
            
            // Initialize processed message IDs from loaded messages
            const processedIds = new Set<string>();
            guestSession.messages.forEach(msg => processedIds.add(msg.id));
            processedMessageIdsRef.current = processedIds;
          } else {
            // Create a new guest chat ID
            const newId = generateGuestChatId();
            console.log("Created new guest chat ID:", newId);
            setChatId(newId);
            setChatIdLoaded(newId);
          }
        } else {
          // Create a new guest chat ID
          const newId = generateGuestChatId();
          console.log("Created new guest chat ID:", newId);
          setChatId(newId);
          setChatIdLoaded(newId);
        }
      } else {
        // For logged in users, we'll load from the database in a separate hook
        if (!chatId) {
          const newId = nanoid();
          console.log("Created new user chat ID:", newId);
          setChatId(newId);
          setChatIdLoaded(newId);
        }
      }
      
      setIsLoading(false);
    };
    
    initializeChat();
  }, [user, isLoaded, hasGuestSession, loadGuestSession, generateGuestChatId, chatId]);
  
  // Create a stable callback function for adding messages
  const stableAddMessage = useCallback((message: Message) => {
    // Skip if we've already processed this message
    if (processedMessageIdsRef.current.has(message.id)) {
      return;
    }
    
    // Add to processed set
    processedMessageIdsRef.current.add(message.id);
    
    // Add to messages state with functional update to prevent race conditions
    setMessages(prev => {
      // Double check to avoid duplicates in case of concurrent updates
      if (prev.some(msg => msg.id === message.id)) {
        return prev;
      }
      return [...prev, message];
    });
  }, []);
  
  // Create a stable callback for updating message history
  const stableUpdateHistory = useCallback((newHistoryItems: string[]) => {
    setMessageHistory(prev => [...prev, ...newHistoryItems]);
  }, []);
  
  // Set up real-time subscription with stable callbacks
  useRealTimeMessages(
    chatId,
    stableAddMessage,
    stableUpdateHistory
  );
  
  // Save guest session when messages change
  useEffect(() => {
    if (!user && chatId && messages.length > 0) {
      saveGuestSession(chatId, messages, messageHistory);
    }
  }, [chatId, messages, messageHistory, saveGuestSession, user]);
  
  const addUserMessage = useCallback((messageData: Message) => {
    console.log("Adding user message:", messageData);
    
    // Skip if already processed
    if (processedMessageIdsRef.current.has(messageData.id)) {
      return messageData;
    }
    
    // Add to processed set
    processedMessageIdsRef.current.add(messageData.id);
    
    // Use functional update to prevent race conditions
    setMessages(prevMessages => {
      // Double check to avoid duplicates
      if (prevMessages.some(msg => msg.id === messageData.id)) {
        return prevMessages;
      }
      return [...prevMessages, messageData];
    });
    
    setMessageHistory(prev => [...prev, messageData.text]);
    return messageData;
  }, []);
  
  const addAIMessage = useCallback((messageData: Message) => {
    console.log("Adding AI message:", messageData);
    
    // Skip if already processed
    if (processedMessageIdsRef.current.has(messageData.id)) {
      return messageData;
    }
    
    // Add to processed set
    processedMessageIdsRef.current.add(messageData.id);
    
    // Use functional update to prevent race conditions
    setMessages(prev => {
      // Double check to avoid duplicates
      if (prev.some(msg => msg.id === messageData.id)) {
        return prev;
      }
      return [...prev, messageData];
    });
    
    return messageData;
  }, []);
  
  const resetChat = useCallback(() => {
    console.log("Resetting chat");
    
    // Clear messages and history
    setMessages([]);
    setMessageHistory([]);
    
    // Clear processed message IDs
    processedMessageIdsRef.current.clear();
    
    // Generate new chat ID
    const newId = nanoid();
    setChatId(newId);
    setChatIdLoaded(newId);
    
    return newId;
  }, []);
  
  const loadChatById = useCallback(async (id: string) => {
    if (id === chatIdLoaded) return;
    
    setIsLoading(true);
    console.log("Loading chat by ID:", id);
    
    try {
      // Set chat ID first
      setChatId(id);
      setChatIdLoaded(id);
      
      // Clear existing messages - they will be loaded via real-time subscription
      setMessages([]);
      setMessageHistory([]);
      
      // Clear processed message IDs for the new chat
      processedMessageIdsRef.current.clear();
    } catch (error) {
      console.error("Error loading chat by ID:", error);
    } finally {
      setIsLoading(false);
    }
  }, [chatIdLoaded]);
  
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
