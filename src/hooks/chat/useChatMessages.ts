
import { useState } from 'react';
import { nanoid } from 'nanoid';
import { Message } from '@/components/chat/types';
import { ChatMessage } from '@/utils/openai';

export const useChatMessages = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'ai',
      text: "Hello! I'm your CarFix AI assistant. How can I help with your vehicle today?",
      timestamp: new Date()
    }
  ]);
  
  const [messageHistory, setMessageHistory] = useState<string[]>([]);
  
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
      .filter(msg => msg.id !== '1') // Filter out the welcome message
      .concat(userMessage)
      .map(msg => ({
        role: msg.sender === 'user' ? 'user' as const : 'assistant' as const,
        content: msg.text
      }));
  };
  
  return {
    messages,
    messageHistory,
    addUserMessage,
    addAIMessage,
    getMessagesForAPI
  };
};
