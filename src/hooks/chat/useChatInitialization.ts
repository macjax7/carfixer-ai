
import { useEffect, useCallback } from 'react';
import { nanoid } from 'nanoid';
import { Message } from '@/components/chat/types';
import { useAuth } from '@/context/AuthContext';

export const useChatInitialization = (
  isLoaded: boolean,
  hasGuestSession: () => boolean,
  loadGuestSession: () => { chatId: string; messages: Message[]; messageHistory: string[] } | null,
  generateGuestChatId: () => string,
  setIsLoading: (isLoading: boolean) => void,
  updateChatId: (id: string) => void,
  updateAllMessages: (messages: Message[]) => void,
  updateMessageHistory: (history: string[]) => void
) => {
  const { user } = useAuth();

  // Initialize chat based on user status and existing sessions
  const initializeChat = useCallback(() => {
    if (!isLoaded) return;
    
    setIsLoading(true);
    console.log("Initializing chat. User:", user?.email || "guest");
    
    // For guest users, try to load from localStorage
    if (!user) {
      if (hasGuestSession()) {
        const guestSession = loadGuestSession();
        if (guestSession) {
          console.log("Loaded guest session:", { 
            chatId: guestSession.chatId,
            messageCount: guestSession.messages.length
          });
          updateChatId(guestSession.chatId);
          updateAllMessages(guestSession.messages);
          updateMessageHistory(guestSession.messageHistory || []);
          
          setIsLoading(false);
          return;
        }
      }
      
      // Create a new guest chat ID if no session exists
      const newId = generateGuestChatId();
      console.log("Created new guest chat ID:", newId);
      updateChatId(newId);
    } else {
      // For logged in users, create a new chat ID
      const newId = nanoid();
      console.log("Created new user chat ID:", newId);
      updateChatId(newId);
    }
    
    setIsLoading(false);
  }, [
    isLoaded, 
    user, 
    hasGuestSession, 
    loadGuestSession, 
    generateGuestChatId, 
    setIsLoading, 
    updateChatId, 
    updateAllMessages, 
    updateMessageHistory
  ]);

  // Run initialization when dependencies change
  useEffect(() => {
    console.log("Running chat initialization effect");
    initializeChat();
  }, [initializeChat]);

  return { initializeChat };
};
