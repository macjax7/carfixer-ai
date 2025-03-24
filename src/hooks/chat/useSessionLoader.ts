
import { useState, useCallback } from 'react';
import { nanoid } from 'nanoid';
import { supabase } from '@/integrations/supabase/client';
import { Message } from '@/components/chat/types';
import { useGuestSession } from './useGuestSession';
import { useAuth } from '@/context/AuthContext';
import { useChatStorage } from './useChatStorage';

export const useSessionLoader = (
  chatId: string | null, 
  setChatId: (id: string) => void
) => {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { loadGuestSession, hasGuestSession, generateGuestChatId } = useGuestSession();
  const { fetchLastChatSession, fetchChatMessages } = useChatStorage(chatId, setChatId);

  // Load initial session or load a specific chat by ID
  const loadChatById = useCallback(async (id: string) => {
    try {
      setChatId(id);
      const chatMessages = await fetchChatMessages(id);
      
      if (chatMessages && chatMessages.length > 0) {
        const formattedMessages = chatMessages.map(msg => ({
          id: msg.id,
          sender: msg.role === 'user' ? 'user' as const : 'ai' as const,
          text: msg.content,
          timestamp: new Date(msg.created_at),
          image: msg.image_url
        }));
        
        // Update message history with user messages
        const userMsgHistory = chatMessages
          .filter(msg => msg.role === 'user')
          .map(msg => msg.content);
        
        return {
          messages: formattedMessages,
          messageHistory: userMsgHistory
        };
      }
      
      return { messages: [], messageHistory: [] };
    } catch (error) {
      console.error("Error loading chat by ID:", error);
      return { messages: [], messageHistory: [] };
    }
  }, [fetchChatMessages, setChatId]);

  // Load initial messages for a user or guest
  const loadInitialSession = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data: session } = await supabase.auth.getSession();
      
      // Handle guest user - check if we have a saved session
      if (!session.session?.user) {
        if (hasGuestSession()) {
          const guestSession = loadGuestSession();
          if (guestSession) {
            setChatId(guestSession.chatId);
            setIsLoading(false);
            return {
              messages: guestSession.messages,
              messageHistory: guestSession.messageHistory
            };
          }
        }
        
        // No existing guest session, create a new chat ID
        setChatId(generateGuestChatId());
        setIsLoading(false);
        return { messages: [], messageHistory: [] };
      }
      
      // Handle logged in user
      const chatSession = await fetchLastChatSession();
      
      if (chatSession) {
        setChatId(chatSession.id);
        
        // Load messages for this session
        const chatMessages = await fetchChatMessages(chatSession.id);
        
        if (chatMessages && chatMessages.length > 0) {
          const formattedMessages = chatMessages.map(msg => ({
            id: msg.id,
            sender: msg.role === 'user' ? 'user' as const : 'ai' as const,
            text: msg.content,
            timestamp: new Date(msg.created_at),
            image: msg.image_url
          }));
          
          // Update message history with user messages
          const userMsgHistory = chatMessages
            .filter(msg => msg.role === 'user')
            .map(msg => msg.content);
          
          setIsLoading(false);
          return {
            messages: formattedMessages,
            messageHistory: userMsgHistory
          };
        }
      } else {
        // No existing chat session found, create a new chat ID
        setChatId(nanoid());
      }
      
      setIsLoading(false);
      return { messages: [], messageHistory: [] };
    } catch (error) {
      console.error("Error in loadInitialSession:", error);
      setChatId(nanoid()); // Fallback to a new chat ID
      setIsLoading(false);
      return { messages: [], messageHistory: [] };
    }
  }, [setChatId, fetchLastChatSession, fetchChatMessages, hasGuestSession, loadGuestSession, generateGuestChatId]);

  return {
    isLoading,
    setIsLoading,
    loadChatById,
    loadInitialSession
  };
};
