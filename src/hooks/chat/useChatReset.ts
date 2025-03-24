
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
    // Clear messages and message history
    updateMessages([]);
    updateMessageHistory([]);
    
    // Generate a new chat ID
    const newChatId = nanoid();
    console.log("Generated new chat ID:", newChatId);
    
    // Update the chat ID in state
    setChatId(newChatId);
    
    // Return the new chat ID so it can be used for navigation if needed
    return newChatId;
  }, [updateMessages, updateMessageHistory, setChatId]);
  
  return { resetChat };
};
