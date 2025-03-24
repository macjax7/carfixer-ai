
import { useEffect } from 'react';
import { nanoid } from 'nanoid';
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
  } = useSessionLoader(chatId, setChatId);
  
  const { saveGuestSession } = useSessionSync(chatId, setChatId);
  
  // Load initial messages when component mounts or auth state changes
  useEffect(() => {
    loadInitialSession();
  }, [user]); // Added user as a dependency to reload when auth changes
  
  return {
    chatId,
    setChatId,
    isLoading,
    loadChatById,
    saveGuestSession
  };
};
