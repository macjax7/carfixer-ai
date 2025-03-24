
import { useEffect, useCallback } from 'react';
import { Message } from '@/components/chat/types';
import { useAuth } from '@/context/AuthContext';

export const useSessionInitialization = (
  chatId: string | null,
  isLoaded: boolean,
  hasGuestSession: () => boolean,
  loadGuestSession: () => { chatId: string; messages: Message[]; messageHistory: string[] } | null,
  generateGuestChatId: () => string,
  updateChatId: (id: string) => void,
  updateAllMessages: (messages: Message[]) => void,
  updateMessageHistory: (history: string[]) => void,
  saveGuestSession: (chatId: string, messages: Message[], messageHistory: string[]) => void,
  messages: Message[],
  messageHistory: string[]
) => {
  const { user } = useAuth();

  // Initialize chat based on user status and existing sessions
  const initializeChat = useCallback(() => {
    if (!isLoaded) return;
    
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
          return;
        }
      }
      
      // Create a new guest chat ID if no session exists
      const newId = generateGuestChatId();
      console.log("Created new guest chat ID:", newId);
      updateChatId(newId);
    }
  }, [
    isLoaded, 
    user, 
    hasGuestSession, 
    loadGuestSession, 
    generateGuestChatId, 
    updateChatId, 
    updateAllMessages, 
    updateMessageHistory
  ]);

  // Save guest session when messages change
  useEffect(() => {
    if (!user && chatId && messages.length > 0) {
      saveGuestSession(chatId, messages, messageHistory);
    }
  }, [chatId, messages, messageHistory, saveGuestSession, user]);

  // Run initialization when dependencies change
  useEffect(() => {
    console.log("Running chat initialization effect");
    initializeChat();
  }, [initializeChat]);

  return { initializeChat };
};
