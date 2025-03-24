
import { useEffect } from 'react';
import { useAuthState } from './useAuthState';
import { useSessionLoader } from './useSessionLoader';
import { useSessionSync } from './useSessionSync';
import { useMessageState } from './useMessageState';

export const useSession = () => {
  const { chatId, setChatId, user } = useAuthState();
  const { messages, updateAllMessages } = useMessageState();
  
  const {
    isLoading,
    setIsLoading,
    loadChatById,
    loadInitialSession
  } = useSessionLoader(chatId, setChatId, updateAllMessages);
  
  const { saveGuestSession } = useSessionSync(chatId, setChatId);
  
  // Load initial messages when component mounts or auth state changes
  useEffect(() => {
    console.log("Initial session effect triggered. User:", user?.email || "none");
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
