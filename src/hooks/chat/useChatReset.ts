
import { useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';

export const useChatReset = (
  updateMessages: (messages: any[]) => void,
  updateMessageHistory: (history: string[]) => void,
  setChatId: (id: string) => void,
  user: any
) => {
  // Enhanced resetChat function that properly clears the chat and generates a proper UUID
  const resetChat = useCallback(() => {
    console.log("resetChat called - clearing messages and generating new UUID chat ID");
    
    try {
      // Clear messages and message history
      updateMessages([]);
      updateMessageHistory([]);
      
      // Generate a new chat ID using UUID format (important for DB compatibility)
      const newChatId = uuidv4();
      console.log("Generated new UUID chat ID:", newChatId);
      
      // Update the chat ID in state
      setChatId(newChatId);
      
      // Return the new chat ID so it can be used for navigation if needed
      return newChatId;
    } catch (error) {
      console.error("Error in resetChat:", error);
      
      // Generate a fallback chat ID if there's an error
      const fallbackId = uuidv4();
      setChatId(fallbackId);
      return fallbackId;
    }
  }, [updateMessages, updateMessageHistory, setChatId]);
  
  return { resetChat };
};
