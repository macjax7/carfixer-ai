
import { useState, useCallback, useEffect } from 'react';
import { nanoid } from 'nanoid';
import { Message } from '@/components/chat/types';
import { ChatMessage } from '@/utils/openai/types';
import { useAuth } from '@/context/AuthContext';
import { useGuestSession } from './useGuestSession';
import { useRealTimeMessages } from './useRealTimeMessages';

export const useChatMessages = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageHistory, setMessageHistory] = useState<string[]>([]);
  const [chatId, setChatId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [chatIdLoaded, setChatIdLoaded] = useState<string | null>(null);
  
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
  
  // Set up real-time subscription
  useRealTimeMessages(chatId, 
    // Add message callback
    (message) => {
      console.log("Adding message from real-time update:", message);
      setMessages(prev => {
        // Check if message already exists to avoid duplicates
        if (prev.some(msg => msg.id === message.id)) {
          return prev;
        }
        return [...prev, message];
      });
    },
    // Update message history callback
    (newHistoryItems) => {
      console.log("Updating message history from real-time update:", newHistoryItems);
      setMessageHistory(prev => [...prev, ...newHistoryItems]);
    }
  );
  
  // Save guest session when messages change
  useEffect(() => {
    if (!user && chatId && messages.length > 0) {
      saveGuestSession(chatId, messages, messageHistory);
    }
  }, [chatId, messages, messageHistory, saveGuestSession, user]);
  
  const addUserMessage = useCallback((messageData: Message) => {
    console.log("Adding user message:", messageData);
    setMessages(prevMessages => [...prevMessages, messageData]);
    setMessageHistory(prev => [...prev, messageData.text]);
    return messageData;
  }, []);
  
  const addAIMessage = useCallback((messageData: Message) => {
    console.log("Adding AI message:", messageData);
    setMessages(prev => [...prev, messageData]);
    return messageData;
  }, []);
  
  const getMessagesForAPI = useCallback((userMessage: Message): ChatMessage[] => {
    return messages
      .concat(userMessage)
      .map(msg => ({
        role: msg.sender === 'user' ? 'user' as const : 'assistant' as const,
        content: msg.text
      }));
  }, [messages]);
  
  const resetChat = useCallback(() => {
    console.log("Resetting chat");
    setMessages([]);
    setMessageHistory([]);
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
      // For now, just set the chat ID
      // Later we'll add loading messages from the database
      setChatId(id);
      setChatIdLoaded(id);
      
      // Clear existing messages - they will be loaded via real-time subscription
      setMessages([]);
      setMessageHistory([]);
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
    getMessagesForAPI,
    resetChat,
    setChatId,
    loadChatById,
    chatIdLoaded
  };
};
