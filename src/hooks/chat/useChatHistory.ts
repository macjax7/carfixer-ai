
import { useCallback } from 'react';
import { useChatMessages } from './useChatMessages';
import { ChatHistoryItem } from '@/components/chat/sidebar/useSidebarState';

export const useChatHistory = () => {
  const { messages, chatId, resetChat } = useChatMessages();
  
  const saveCurrentChat = useCallback(() => {
    if (messages.length === 0) return;
    
    const firstUserMessage = messages.find(m => m.sender === 'user');
    if (!firstUserMessage) return;
    
    const title = firstUserMessage.text.length > 30 
      ? firstUserMessage.text.substring(0, 30) + '...' 
      : firstUserMessage.text;
    
    const chatToSave: Omit<ChatHistoryItem, 'id'> = {
      title,
      timestamp: 'Just now',
      path: `#/chat/${chatId}`
    };
    
    console.log('Saving chat to history:', chatToSave);
  }, [messages, chatId]);
  
  return {
    saveCurrentChat,
    resetChat
  };
};
