
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { ChatHistoryItem } from './types';

export const useChatHistory = () => {
  const { user } = useAuth();
  
  const [chatHistoryOpen, setChatHistoryOpen] = useState(true);
  const [chatHistory, setChatHistory] = useState<ChatHistoryItem[]>([]);

  return {
    chatHistoryOpen,
    setChatHistoryOpen,
    chatHistory,
    setChatHistory
  };
};
