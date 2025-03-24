
import { useCallback } from 'react';
import { nanoid } from 'nanoid';

export const useChatReset = (
  updateMessages: (messages: any[]) => void,
  updateMessageHistory: (history: string[]) => void,
  setChatId: (id: string) => void,
  user: any
) => {
  // Enhanced resetChat function that properly clears the chat and generates a new ID
  const resetChat = useCallback(() => {
    // In a complete implementation, we would save the messages to history here
    updateMessages([]);
    updateMessageHistory([]);
    const newChatId = nanoid();
    setChatId(newChatId);
    
    return newChatId;
  }, [user, updateMessages, updateMessageHistory, setChatId]);
  
  return { resetChat };
};
