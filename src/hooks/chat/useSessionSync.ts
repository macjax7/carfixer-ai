
import { useEffect, useCallback } from 'react';
import { Message } from '@/components/chat/types';
import { useGuestSession } from './useGuestSession';
import { useAuth } from '@/context/AuthContext';
import { useChatStorage } from './useChatStorage';
import { useToast } from '@/hooks/use-toast';

export const useSessionSync = (
  chatId: string | null, 
  setChatId: (id: string) => void
) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const {
    loadGuestSession,
    hasGuestSession,
    isLoaded: isGuestSessionLoaded,
    clearGuestSession,
    saveGuestSession
  } = useGuestSession();

  // Define a function to handle messages loaded from storage
  const handleMessagesLoaded = useCallback((messages: Message[]) => {
    console.log("Messages loaded from storage:", messages.length);
  }, []);

  const {
    createChatSession,
    storeUserMessage,
    storeAIMessage
  } = useChatStorage(chatId, handleMessagesLoaded);

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
        console.log("Detected guest session and user login, syncing data...");
        
        const guestSession = loadGuestSession();
        
        if (guestSession && guestSession.messages.length > 0) {
          try {
            toast({
              title: "Syncing guest session",
              description: "Your previous messages are being saved to your account",
            });
            
            // Create a new chat session for the authenticated user
            const firstUserMessage = guestSession.messages.find(m => m.sender === 'user');
            if (!firstUserMessage) {
              console.log("No user messages found in guest session");
              return;
            }
            
            // Create a new chat session
            const newSessionId = await createChatSession(firstUserMessage);
            
            if (newSessionId) {
              console.log("Created new session for synced data:", newSessionId);
              
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
              
              toast({
                title: "Session Synced",
                description: "Your conversations have been saved to your account",
              });
              
              return {
                chatId: newSessionId,
                messages: guestSession.messages,
                messageHistory: guestSession.messageHistory
              };
            }
          } catch (error) {
            console.error('Error syncing guest session:', error);
            toast({
              title: "Sync Error",
              description: "Failed to sync your previous messages",
              variant: "destructive"
            });
          }
        }
      }
      return null;
    };
    
    syncGuestSession();
  }, [user, isGuestSessionLoaded, loadGuestSession, clearGuestSession, hasGuestSession, createChatSession, storeUserMessage, storeAIMessage, setChatId, toast]);

  return {
    saveGuestSession: saveCurrentGuestSession
  };
};
