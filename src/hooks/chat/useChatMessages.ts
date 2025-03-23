
import { useState, useEffect, useCallback } from 'react';
import { nanoid } from 'nanoid';
import { Message } from '@/components/chat/types';
import { ChatMessage } from '@/utils/openai/types';
import { useChatStorage } from './useChatStorage';
import { useChatSubscription } from './useChatSubscription';
import { UseChatMessagesResult } from './types';

export const useChatMessages = (): UseChatMessagesResult => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageHistory, setMessageHistory] = useState<string[]>([]);
  const [chatId, setChatId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    createChatSession,
    storeUserMessage,
    storeAIMessage,
    fetchLastChatSession,
    fetchChatMessages
  } = useChatStorage(chatId, setChatId);
  
  // Set up subscription to real-time updates
  useChatSubscription(chatId, setMessages, setMessageHistory);
  
  // Load initial messages
  useEffect(() => {
    const loadMessages = async () => {
      try {
        const { data: session } = await supabase.auth.getSession();
        if (!session.session?.user) {
          // If no user is logged in, just create a new chat ID
          setChatId(nanoid());
          return;
        }
        
        setIsLoading(true);
        
        // Get the most recent chat session
        const chatSession = await fetchLastChatSession();
        
        if (chatSession) {
          setChatId(chatSession.id);
          
          // Load messages for this session
          const chatMessages = await fetchChatMessages(chatSession.id);
          
          if (chatMessages && chatMessages.length > 0) {
            const formattedMessages = chatMessages.map(msg => ({
              id: msg.id,
              sender: msg.role === 'user' ? 'user' as const : 'ai' as const,
              text: msg.content,
              timestamp: new Date(msg.created_at),
              image: msg.image_url
            }));
            
            setMessages(formattedMessages);
            
            // Update message history with user messages
            const userMsgHistory = chatMessages
              .filter(msg => msg.role === 'user')
              .map(msg => msg.content);
            
            setMessageHistory(userMsgHistory);
          }
        } else {
          // No existing chat session found, create a new chat ID
          setChatId(nanoid());
        }
      } catch (error) {
        console.error("Error in loadMessages:", error);
        setChatId(nanoid()); // Fallback to a new chat ID
      } finally {
        setIsLoading(false);
      }
    };
    
    loadMessages();
  }, []); // Empty dependency array to run only once on mount
  
  const addUserMessage = useCallback((messageData: Message) => {
    setMessages(prevMessages => [...prevMessages, messageData]);
    setMessageHistory(prev => [...prev, messageData.text]);
    
    // Store the message in the database if user is logged in
    if (chatId) {
      storeUserMessage(messageData, chatId);
    }
    
    return messageData;
  }, [chatId, storeUserMessage]);
  
  const addAIMessage = useCallback((messageData: Message) => {
    setMessages(prev => [...prev, messageData]);
    
    // Store AI response in the database if user is logged in
    if (chatId) {
      storeAIMessage(messageData, chatId);
    }
    
    return messageData;
  }, [chatId, storeAIMessage]);
  
  const getMessagesForAPI = useCallback((userMessage: Message): ChatMessage[] => {
    return messages
      .concat(userMessage)
      .map(msg => ({
        role: msg.sender === 'user' ? 'user' as const : 'assistant' as const,
        content: msg.text
      }));
  }, [messages]);
  
  // Enhanced resetChat function that properly clears the chat and generates a new ID
  const resetChat = useCallback(() => {
    // In a complete implementation, we would save the messages to history here
    setMessages([]);
    setMessageHistory([]);
    setChatId(nanoid()); // Generate a new chat ID for the new conversation
  }, []);
  
  const addMessage = useCallback((message: Message) => {
    setMessages(prev => [...prev, message]);
    if (message.sender === 'user') {
      setMessageHistory(prev => [...prev, message.text]);
    }
  }, []);
  
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
    setChatId
  };
};

// Need to import supabase for the useEffect
import { supabase } from '@/integrations/supabase/client';
