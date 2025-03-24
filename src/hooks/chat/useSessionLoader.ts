
import { useCallback, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useChatStorage } from './useChatStorage';
import { Message } from '@/components/chat/types';

export const useSessionLoader = (
  chatId: string | null, 
  setChatId: (id: string) => void,
  setMessages: (messages: Message[]) => void
) => {
  const { user } = useAuth();
  
  const handleMessagesLoaded = useCallback((messages: Message[]) => {
    setMessages(messages);
  }, [setMessages]);
  
  const { fetchLastChatSession, fetchChatMessages, loadChatMessages } = useChatStorage(chatId, handleMessagesLoaded);
  
  // Load last session for authenticated users
  const loadUserSession = useCallback(async () => {
    if (!user) return;
    
    try {
      const session = await fetchLastChatSession();
      
      if (session && session.id) {
        console.log("Loading last user session:", session.id);
        setChatId(session.id);
        
        const messages = await fetchChatMessages(session.id);
        if (messages && messages.length > 0) {
          setMessages(messages);
        }
      }
    } catch (error) {
      console.error("Error loading user session:", error);
    }
  }, [user, fetchLastChatSession, fetchChatMessages, setChatId, setMessages]);
  
  // Initial loading of session data
  useEffect(() => {
    if (chatId) {
      loadChatMessages();
    } else if (user) {
      loadUserSession();
    }
  }, [chatId, user, loadChatMessages, loadUserSession]);
  
  return { loadUserSession };
};
