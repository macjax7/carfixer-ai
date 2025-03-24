
import { useEffect, useState } from 'react';
import { nanoid } from 'nanoid';
import { Message } from '@/components/chat/types';
import { useToast } from '@/components/ui/use-toast';

const GUEST_SESSION_KEY = 'carfix_guest_session';

interface GuestSession {
  chatId: string;
  messages: Message[];
  messageHistory: string[];
}

export const useGuestSession = () => {
  const { toast } = useToast();
  const [isLoaded, setIsLoaded] = useState(false);

  // Save the current guest session to localStorage
  const saveGuestSession = (chatId: string, messages: Message[], messageHistory: string[]) => {
    try {
      const sessionData: GuestSession = {
        chatId,
        messages,
        messageHistory
      };
      localStorage.setItem(GUEST_SESSION_KEY, JSON.stringify(sessionData));
    } catch (error) {
      console.error('Error saving guest session:', error);
    }
  };

  // Load the guest session from localStorage
  const loadGuestSession = (): GuestSession | null => {
    try {
      const sessionData = localStorage.getItem(GUEST_SESSION_KEY);
      if (sessionData) {
        return JSON.parse(sessionData);
      }
    } catch (error) {
      console.error('Error loading guest session:', error);
    }
    
    // If no session exists or error occurred, return null
    return null;
  };

  // Clear the guest session from localStorage
  const clearGuestSession = () => {
    try {
      localStorage.removeItem(GUEST_SESSION_KEY);
    } catch (error) {
      console.error('Error clearing guest session:', error);
    }
  };

  // Check if a guest session exists
  const hasGuestSession = (): boolean => {
    return localStorage.getItem(GUEST_SESSION_KEY) !== null;
  };

  // Generate a new chat ID for guest session
  const generateGuestChatId = (): string => {
    return nanoid();
  };

  // Initialize guest session
  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return {
    saveGuestSession,
    loadGuestSession,
    clearGuestSession,
    hasGuestSession,
    generateGuestChatId,
    isLoaded
  };
};
