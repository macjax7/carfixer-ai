
import { useCallback, useEffect } from 'react';
import { Message } from '@/components/chat/types';
import { useAuth } from '@/context/AuthContext';

export const useMessageSync = (
  chatId: string | null,
  messages: Message[],
  messageHistory: string[],
  saveGuestSession: (chatId: string, messages: Message[], messageHistory: string[]) => void
) => {
  const { user } = useAuth();
  
  // Auto-save guest session when messages change
  const syncGuestMessages = useCallback(() => {
    if (!user && chatId && messages.length > 0) {
      saveGuestSession(chatId, messages, messageHistory);
    }
  }, [user, messages, messageHistory, chatId, saveGuestSession]);
  
  // Set up auto-sync effect
  useEffect(() => {
    syncGuestMessages();
  }, [syncGuestMessages]);
  
  return { syncGuestMessages };
};
