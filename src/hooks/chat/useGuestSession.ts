
import { useState, useEffect } from 'react';
import { nanoid } from 'nanoid';
import { Message } from '@/components/chat/types';

const STORAGE_KEY = 'carfix_guest_chat';

export const useGuestSession = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  // Load session data from localStorage on mount
  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const generateGuestChatId = () => {
    return nanoid();
  };

  const loadGuestSession = () => {
    try {
      const savedData = localStorage.getItem(STORAGE_KEY);
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        return {
          chatId: parsedData.chatId,
          messages: parsedData.messages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          })),
          messageHistory: parsedData.messageHistory || []
        };
      }
    } catch (error) {
      console.error('Error loading guest session:', error);
    }
    return null;
  };

  const saveGuestSession = (
    chatId: string,
    messages: Message[],
    messageHistory: string[]
  ) => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          chatId,
          messages,
          messageHistory
        })
      );
    } catch (error) {
      console.error('Error saving guest session:', error);
    }
  };

  const clearGuestSession = () => {
    localStorage.removeItem(STORAGE_KEY);
  };

  const hasGuestSession = () => {
    return !!localStorage.getItem(STORAGE_KEY);
  };

  return {
    loadGuestSession,
    saveGuestSession,
    clearGuestSession,
    hasGuestSession,
    generateGuestChatId,
    isLoaded
  };
};
