
import { useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useChatDatabase } from './useChatDatabase';

export const useChatSession = (chatId: string | null, setChatId: (id: string) => void) => {
  const {
    createChatSession,
    updateChatSessionTitle,
    getChatMessageCount
  } = useChatDatabase();

  const ensureChatSession = useCallback(async (text: string, userId: string | undefined) => {
    let currentChatId = chatId;
    
    console.log("Ensuring chat session with initial chatId:", chatId);
    
    if (!currentChatId && userId) {
      // Create a new chat session with a proper UUID
      const title = text.length > 30 
        ? text.substring(0, 30) + '...' 
        : text;
        
      console.log("Creating new chat session for authenticated user");
      const newChatId = await createChatSession(title, userId);
      if (newChatId) {
        console.log("Created new chat session with ID:", newChatId);
        currentChatId = newChatId;
        setChatId(newChatId);
      } else {
        // If we couldn't create a session, use a temporary ID
        const tempId = uuidv4();
        console.log("Failed to create chat session, using temporary chat ID:", tempId);
        currentChatId = tempId;
        setChatId(tempId);
      }
    } else if (!currentChatId) {
      // For non-logged-in users, use a UUID
      const tempId = uuidv4();
      console.log("Using temporary chat ID for non-logged user:", tempId);
      currentChatId = tempId;
      setChatId(tempId);
    } else {
      console.log("Using existing chat ID:", currentChatId);
    }
    
    return currentChatId;
  }, [chatId, setChatId, createChatSession]);

  const updateSessionTitle = useCallback(async (sessionId: string, text: string, userId: string | undefined) => {
    if (!userId || !sessionId) return;
    
    try {
      console.log("Checking message count for session:", sessionId);
      const messageCount = await getChatMessageCount(sessionId);
      console.log("Current message count:", messageCount);
        
      if (messageCount === 0) {
        const title = text.length > 30 
          ? text.substring(0, 30) + '...' 
          : text;
          
        console.log("Updating session title to:", title);
        await updateChatSessionTitle(sessionId, title);
      }
    } catch (error) {
      console.error("Error checking message count:", error);
      // Continue even if this fails
    }
  }, [getChatMessageCount, updateChatSessionTitle]);

  return {
    ensureChatSession,
    updateSessionTitle
  };
};
