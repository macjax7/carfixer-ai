
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { ChatHistoryItem } from './types';

export const useChatHistory = () => {
  const { user } = useAuth();
  
  // Initialize chatHistoryOpen based on whether user is authenticated
  const [chatHistoryOpen, setChatHistoryOpen] = useState(!!user);
  const [chatHistory, setChatHistory] = useState<ChatHistoryItem[]>([]);
  
  // Close chat history section when there are no chats
  useEffect(() => {
    if (chatHistory.length === 0) {
      setChatHistoryOpen(false);
    }
  }, [chatHistory]);

  return {
    chatHistoryOpen,
    setChatHistoryOpen,
    chatHistory,
    setChatHistory
  };
};
