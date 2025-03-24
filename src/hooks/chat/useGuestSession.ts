
import { useState, useEffect, useCallback } from 'react';
import { Message } from '@/components/chat/types';
import { v4 as uuidv4 } from 'uuid';
import { useToast } from '@/hooks/use-toast';

const STORAGE_KEY = 'carfix_guest_chat';
const MAX_MESSAGES_TO_STORE = 10; // Limit storage to prevent quota issues

export const useGuestSession = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const { toast } = useToast();
  
  // Load guest session from localStorage
  const loadGuestSession = useCallback(() => {
    try {
      const chatData = localStorage.getItem(STORAGE_KEY);
      if (chatData) {
        const parsed = JSON.parse(chatData);
        console.log("Loaded guest session:", {
          chatId: parsed.chatId,
          messageCount: parsed.messages?.length || 0
        });
        return parsed;
      }
    } catch (error) {
      console.error("Error loading guest session:", error);
    }
    return null;
  }, []);

  // Check if guest session exists
  const hasGuestSession = useCallback(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) !== null;
    } catch (error) {
      console.error("Error checking guest session:", error);
      return false;
    }
  }, []);

  // Save guest session to localStorage with quota protection
  const saveGuestSession = useCallback((chatId: string, messages: Message[], messageHistory: string[]) => {
    try {
      // Limit the number of messages to prevent exceeding quota
      const limitedMessages = messages.slice(-MAX_MESSAGES_TO_STORE);
      const limitedHistory = messageHistory.slice(-MAX_MESSAGES_TO_STORE);
      
      const data = {
        chatId,
        messages: limitedMessages,
        messageHistory: limitedHistory,
        timestamp: new Date().toISOString()
      };
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error("Error saving guest session:", error);
      
      // If we hit a quota error, try to clear some space
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        try {
          // Clear the storage and store minimal data
          localStorage.removeItem(STORAGE_KEY);
          const minimalData = {
            chatId,
            messages: messages.slice(-3), // Keep only the last 3 messages
            messageHistory: [],
            timestamp: new Date().toISOString()
          };
          localStorage.setItem(STORAGE_KEY, JSON.stringify(minimalData));
          
          toast({
            title: "Storage Limit Reached",
            description: "Some message history was cleared. Sign in to keep your chat history.",
            variant: "destructive"
          });
        } catch (innerError) {
          console.error("Failed to recover from storage error:", innerError);
        }
      }
    }
  }, [toast]);

  // Generate a unique ID for guest chat
  const generateGuestChatId = useCallback(() => {
    return uuidv4(); // Generate proper UUID for compatibility with Supabase
  }, []);

  // Set isLoaded to true after initial render
  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return {
    loadGuestSession,
    saveGuestSession,
    hasGuestSession,
    generateGuestChatId,
    isLoaded
  };
};
