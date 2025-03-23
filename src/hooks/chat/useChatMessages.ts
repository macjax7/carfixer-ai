
import { useState } from 'react';
import { nanoid } from 'nanoid';
import { Message } from '@/components/chat/types';
import { ChatMessage } from '@/utils/openai';

export const useChatMessages = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageHistory, setMessageHistory] = useState<string[]>([]);
  const [chatId, setChatId] = useState<string>(nanoid());
  
  const addUserMessage = (text: string, image?: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text,
      timestamp: new Date(),
      image
    };
    
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setMessageHistory(prev => [...prev, text]);
    
    return userMessage;
  };
  
  const addAIMessage = (text: string, options?: {
    vehicleListingAnalysis?: Message['vehicleListingAnalysis'];
    componentDiagram?: Message['componentDiagram'];
  }) => {
    const aiMessage: Message = {
      id: nanoid(),
      sender: 'ai',
      text,
      timestamp: new Date(),
      ...options
    };
    
    setMessages(prev => [...prev, aiMessage]);
    return aiMessage;
  };
  
  const getMessagesForAPI = (userMessage: Message): ChatMessage[] => {
    return messages
      .concat(userMessage)
      .map(msg => ({
        role: msg.sender === 'user' ? 'user' as const : 'assistant' as const,
        content: msg.text
      }));
  };
  
  // Enhanced resetChat function that properly clears the chat and generates a new ID
  const resetChat = () => {
    // In a complete implementation, we would save the messages to history here
    setMessages([]);
    setMessageHistory([]);
    setChatId(nanoid()); // Generate a new chat ID for the new conversation
  };
  
  return {
    messages,
    messageHistory,
    chatId,
    addUserMessage,
    addAIMessage,
    getMessagesForAPI,
    resetChat
  };
};
