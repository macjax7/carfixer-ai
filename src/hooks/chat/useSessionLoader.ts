
import { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/integrations/supabase/client';
import { Message } from '@/components/chat/types';
import { useGuestSession } from './useGuestSession';
import { useAuth } from '@/context/AuthContext';
import { useChatStorage } from './useChatStorage';
import { toast } from '@/components/ui/use-toast';

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
      console.log("Loading chat by ID:", id);
      setChatId(id);
      const chatMessages = await fetchChatMessages(id);
      
      if (chatMessages && chatMessages.length > 0) {
        console.log(`Found ${chatMessages.length} messages for chat ${id}`);
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
      
      console.log("No messages found for chat ID:", id);
      return { messages: [], messageHistory: [] };
    } catch (error) {
      console.error("Error loading chat by ID:", error);
      toast({
        variant: "destructive",
        title: "Error loading chat",
        description: "Could not load the requested chat. Please try again."
      });
      return { messages: [], messageHistory: [] };
    }
  }, [fetchChatMessages, setChatId]);

  // Load initial messages for a user or guest
  const loadInitialSession = useCallback(async () => {
    setIsLoading(true);
    try {
      console.log("Loading initial session...");
      const { data: session } = await supabase.auth.getSession();
      
      // Handle guest user - check if we have a saved session
      if (!session.session?.user) {
        console.log("No authenticated user found, checking for guest session");
        if (hasGuestSession()) {
          const guestSession = loadGuestSession();
          if (guestSession) {
            console.log("Loaded guest session:", { 
              chatId: guestSession.chatId,
              messageCount: guestSession.messages.length
            });
            setChatId(guestSession.chatId);
            setIsLoading(false);
            return {
              messages: guestSession.messages,
              messageHistory: guestSession.messageHistory || []
            };
          }
        }
        
        // No existing guest session, create a new chat ID
        console.log("No guest session found, creating new guest chat ID");
        setChatId(generateGuestChatId());
        setIsLoading(false);
        return { messages: [], messageHistory: [] };
      }
      
      // Handle logged in user
      console.log("Authenticated user found, looking for last chat session");
      const chatSession = await fetchLastChatSession();
      
      if (chatSession) {
        console.log("Found existing chat session:", chatSession.id);
        setChatId(chatSession.id);
        
        // Load messages for this session
        const chatMessages = await fetchChatMessages(chatSession.id);
        
        if (chatMessages && chatMessages.length > 0) {
          console.log(`Retrieved ${chatMessages.length} messages for session ${chatSession.id}`);
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
        console.log("No chat session found, creating new UUID");
        setChatId(uuidv4());
      }
      
      setIsLoading(false);
      return { messages: [], messageHistory: [] };
    } catch (error) {
      console.error("Error in loadInitialSession:", error);
      setChatId(uuidv4()); // Fallback to a new chat ID
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
