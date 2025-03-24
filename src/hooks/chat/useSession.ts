
import { useEffect } from 'react';
import { useAuthState } from './useAuthState';
import { useSessionLoader } from './useSessionLoader';
import { useSessionSync } from './useSessionSync';

export const useSession = () => {
  const { chatId, setChatId, user } = useAuthState();
  
  const {
    isLoading,
    setIsLoading,
    loadChatById,
    loadInitialSession
  } = useSessionLoader(chatId, setChatId, () => {
    // Empty callback for setMessages as we'll handle messages through real-time subscription
    console.log("Session messages loaded");
  });
  
  const { saveGuestSession } = useSessionSync(chatId, setChatId);
  
  // Load initial messages when component mounts or auth state changes
  useEffect(() => {
    loadInitialSession();
  }, [user, loadInitialSession]); 
  
  return {
    chatId,
    setChatId,
    isLoading,
    loadChatById,
    saveGuestSession
  };
};
