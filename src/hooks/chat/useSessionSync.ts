
import { useEffect, useCallback } from 'react';
import { Message } from '@/components/chat/types';
import { useGuestSession } from './useGuestSession';
import { useAuth } from '@/context/AuthContext';
import { useChatStorage } from './useChatStorage';

export const useSessionSync = (
  chatId: string | null, 
  setChatId: (id: string) => void
) => {
  const { user } = useAuth();
  const {
    loadGuestSession,
    clearGuestSession,
    hasGuestSession,
    isLoaded: isGuestSessionLoaded,
    saveGuestSession
  } = useGuestSession();

  const {
    createChatSession,
    storeUserMessage,
    storeAIMessage
  } = useChatStorage(chatId, setChatId);

  // Save guest session
  const saveCurrentGuestSession = useCallback((
    chatId: string, 
    messages: Message[], 
    messageHistory: string[]
  ) => {
    if (!user) {
      saveGuestSession(chatId, messages, messageHistory);
    }
  }, [user, saveGuestSession]);

  // Sync guest session with database when user logs in
  useEffect(() => {
    const syncGuestSession = async () => {
      // Only run this effect when a user logs in and there's a guest session
      if (user && hasGuestSession() && isGuestSessionLoaded) {
        const guestSession = loadGuestSession();
        
        if (guestSession && guestSession.messages.length > 0) {
          try {
            // Create a new chat session for the authenticated user
            const firstUserMessage = guestSession.messages.find(m => m.sender === 'user');
            if (!firstUserMessage) return;
            
            // Create a new chat session
            const newSessionId = await createChatSession(firstUserMessage);
            
            if (newSessionId) {
              // Upload all messages from the guest session
              for (const msg of guestSession.messages) {
                if (msg.sender === 'user') {
                  await storeUserMessage(msg, newSessionId);
                } else {
                  await storeAIMessage(msg, newSessionId);
                }
              }
              
              // Set the current chat to the new session
              setChatId(newSessionId);
              
              // Clear the guest session
              clearGuestSession();
              
              console.log('Guest session synchronized to user account');
              
              return {
                chatId: newSessionId,
                messages: guestSession.messages,
                messageHistory: guestSession.messageHistory
              };
            }
          } catch (error) {
            console.error('Error syncing guest session:', error);
          }
        }
      }
      return null;
    };
    
    syncGuestSession();
  }, [user, isGuestSessionLoaded, loadGuestSession, clearGuestSession, hasGuestSession, createChatSession, storeUserMessage, storeAIMessage, setChatId]);

  return {
    saveGuestSession: saveCurrentGuestSession
  };
};
