
import { useState } from 'react';
import { ChatHistoryItem } from './types';

export const useChatHistory = () => {
  // Chat history section state
  const [chatHistoryOpen, setChatHistoryOpen] = useState(false);
  
  // Chat history data
  const [chatHistory, setChatHistory] = useState<ChatHistoryItem[]>([
    { id: 1, title: "Check Engine Light P0420", timestamp: "2h ago", path: "#" },
    { id: 2, title: "Battery Replacement Options", timestamp: "Yesterday", path: "#" },
    { id: 3, title: "Brake Fluid Change", timestamp: "3d ago", path: "#" },
    { id: 4, title: "Transmission Warning Signs", timestamp: "1w ago", path: "#" },
  ]);

  return {
    chatHistoryOpen,
    setChatHistoryOpen,
    chatHistory
  };
};
