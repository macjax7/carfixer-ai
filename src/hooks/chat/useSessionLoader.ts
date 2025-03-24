
import { useCallback, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useChatStorage } from './useChatStorage';
import { Message } from '@/components/chat/types';

export const useSessionLoader = (
  chatId: string | null, 
  setChatId: (id: string) => void,
  setMessages: (messages: Message[]) => void
) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  
  const handleMessagesLoaded = useCallback((messages: Message[]) => {
    setMessages(messages);
  }, [setMessages]);
  
  const { fetchLastChatSession, fetchChatMessages, loadChatMessages } = useChatStorage(chatId, handleMessagesLoaded);
  
  // Load existing chat by ID
  const loadChatById = useCallback(async (id: string) => {
    if (!id) return;
    
    setIsLoading(true);
    console.log("Loading chat by ID:", id);
    
    try {
      setChatId(id);
      
      if (user) {
        const messages = await fetchChatMessages(id);
        if (messages && messages.length > 0) {
          setMessages(messages);
        }
      }
    } catch (error) {
      console.error("Error loading chat by ID:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user, fetchChatMessages, setChatId, setMessages]);
  
  // Load last session for authenticated users
  const loadUserSession = useCallback(async () => {
    if (!user) return;
    
    setIsLoading(true);
    console.log("Loading user session for:", user.email);
    
    try {
      const session = await fetchLastChatSession();
      
      if (session && session.id) {
        console.log("Loading last user session:", session.id);
        setChatId(session.id);
        
        const messages = await fetchChatMessages(session.id);
        if (messages && messages.length > 0) {
          console.log(`Loaded ${messages.length} messages for user session`);
          setMessages(messages);
        }
      } else {
        console.log("No previous sessions found for user");
      }
    } catch (error) {
      console.error("Error loading user session:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user, fetchLastChatSession, fetchChatMessages, setChatId, setMessages]);
  
  // Function to load the initial session based on user state
  const loadInitialSession = useCallback(async () => {
    console.log("Loading initial session. User:", user?.email || "none", "ChatId:", chatId);
    
    if (chatId) {
      console.log("Using existing chatId:", chatId);
      await loadChatById(chatId);
    } else if (user) {
      console.log("Loading user session for authenticated user");
      await loadUserSession();
    } else {
      console.log("No session to load - user is not authenticated and no chatId provided");
    }
  }, [chatId, user, loadChatById, loadUserSession]);
  
  return { 
    loadUserSession,
    loadChatById,
    loadInitialSession,
    isLoading,
    setIsLoading
  };
};
