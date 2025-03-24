
import { useState, useEffect } from 'react';
import { nanoid } from 'nanoid';
import { Message } from '@/components/chat/types';

export const useGuestSession = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Load guest session from localStorage
  const loadGuestSession = () => {
    try {
      const storedSession = localStorage.getItem('guestSession');
      if (storedSession) {
        const session = JSON.parse(storedSession);
        return session;
      }
    } catch (error) {
      console.error('Error loading guest session:', error);
    }
    return null;
  };
  
  // Save guest session to localStorage
  const saveGuestSession = (
    chatId: string, 
    messages: Message[], 
    messageHistory: string[]
  ) => {
    try {
      const session = {
        chatId,
        messages,
        messageHistory
      };
      localStorage.setItem('guestSession', JSON.stringify(session));
    } catch (error) {
      console.error('Error saving guest session:', error);
    }
  };
  
  // Clear guest session from localStorage
  const clearGuestSession = () => {
    try {
      localStorage.removeItem('guestSession');
    } catch (error) {
      console.error('Error clearing guest session:', error);
    }
  };
  
  // Check if guest session exists
  const hasGuestSession = () => {
    try {
      return !!localStorage.getItem('guestSession');
    } catch (error) {
      console.error('Error checking guest session:', error);
      return false;
    }
  };

  // Generate a new chat ID for guest users
  const generateGuestChatId = () => {
    return nanoid();
  };
  
  // Initialize state when component mounts
  useEffect(() => {
    try {
      // Check if we have a session in localStorage
      const hasSession = hasGuestSession();
      setIsLoaded(true);
    } catch (error) {
      console.error('Error initializing guest session:', error);
      setIsLoaded(true);
    }
  }, []);
  
  return {
    loadGuestSession,
    saveGuestSession,
    clearGuestSession,
    hasGuestSession,
    generateGuestChatId,
    isLoaded
  };
};
