
import { useState, useCallback } from 'react';
import { Message } from '@/components/chat/types';
import { ChatMessage } from '@/utils/openai/types';
import { useChatStorage } from './useChatStorage';
import { useAuth } from '@/context/AuthContext';

export const useMessages = (chatId: string | null) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageHistory, setMessageHistory] = useState<string[]>([]);
  
  const { user } = useAuth();
  const { storeUserMessage, storeAIMessage } = useChatStorage(chatId, () => {});

  const addUserMessage = useCallback((messageData: Message) => {
    setMessages(prevMessages => [...prevMessages, messageData]);
    setMessageHistory(prev => [...prev, messageData.text]);
    
    // Store the message in the database if user is logged in
    if (chatId && user) {
      storeUserMessage(messageData, chatId);
    }
    
    return messageData;
  }, [chatId, storeUserMessage, user]);
  
  const addAIMessage = useCallback((messageData: Message) => {
    setMessages(prev => [...prev, messageData]);
    
    // Store AI response in the database if user is logged in
    if (chatId && user) {
      storeAIMessage(messageData, chatId);
    }
    
    return messageData;
  }, [chatId, storeAIMessage, user]);
  
  const getMessagesForAPI = useCallback((userMessage: Message): ChatMessage[] => {
    return messages
      .concat(userMessage)
      .map(msg => ({
        role: msg.sender === 'user' ? 'user' as const : 'assistant' as const,
        content: msg.text
      }));
  }, [messages]);
  
  const addMessage = useCallback((message: Message) => {
    setMessages(prev => [...prev, message]);
    if (message.sender === 'user') {
      setMessageHistory(prev => [...prev, message.text]);
    }
  }, []);

  const updateMessages = useCallback((newMessages: Message[]) => {
    setMessages(newMessages);
  }, []);

  const updateMessageHistory = useCallback((newHistory: string[]) => {
    setMessageHistory(newHistory);
  }, []);
  
  return {
    messages,
    messageHistory,
    addUserMessage,
    addAIMessage,
    getMessagesForAPI,
    addMessage,
    updateMessages,
    updateMessageHistory
  };
};
