
import { useSessionStorage } from './useSessionStorage';
import { useMessageStorage } from './useMessageStorage';
import { ChatStorageOperations } from './types';

export const useChatStorage = (
  chatId: string | null,
  setChatId: (id: string) => void
): ChatStorageOperations => {
  const { createChatSession, fetchLastChatSession } = useSessionStorage(setChatId);
  const { storeUserMessage, storeAIMessage, fetchChatMessages } = useMessageStorage();

  return {
    createChatSession,
    storeUserMessage,
    storeAIMessage,
    fetchLastChatSession,
    fetchChatMessages
  };
};
