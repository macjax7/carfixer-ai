
import { useState, useCallback } from 'react';
import { nanoid } from 'nanoid';

export const useChatState = () => {
  const [chatId, setChatId] = useState<string | null>(null);
  const [chatIdLoaded, setChatIdLoaded] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Set both chatId and chatIdLoaded
  const updateChatId = useCallback((id: string) => {
    setChatId(id);
    setChatIdLoaded(id);
  }, []);

  // Generate a new chat ID
  const generateNewChatId = useCallback(() => {
    const newId = nanoid();
    updateChatId(newId);
    return newId;
  }, [updateChatId]);

  return {
    chatId,
    chatIdLoaded,
    isLoading,
    setIsLoading,
    setChatId,
    setChatIdLoaded,
    updateChatId,
    generateNewChatId
  };
};
