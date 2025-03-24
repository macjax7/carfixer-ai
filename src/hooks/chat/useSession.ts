
import { useState, useEffect } from 'react';
import { nanoid } from 'nanoid';
import { supabase } from '@/integrations/supabase/client';
import { useGuestSession } from './useGuestSession';
import { useAuth } from '@/context/AuthContext';
import { useChatStorage } from './useChatStorage';
import { Message } from '@/components/chat/types';

export const useSession = () => {
  const [chatId, setChatId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const { user } = useAuth();
  const {
    saveGuestSession,
    loadGuestSession,
    clearGuestSession,
    hasGuestSession,
    generateGuestChatId,
    isLoaded: isGuestSessionLoaded
  } = useGuestSession();

  const {
    createChatSession,
    fetchLastChatSession,
    fetchChatMessages,
    storeUserMessage,
    storeAIMessage
  } = useChatStorage(chatId, setChatId);
  
  // Sync guest session with database when user logs in
  useEffect(() => {
    const syncGuestSession = async () => {
      // Only run this effect when a user logs in and there's a guest session
      if (user && hasGuestSession() && isGuestSessionLoaded) {
        const guestSession = loadGuestSession();
        
        if (guestSession && guestSession.messages.length > 0) {
          try {
            // Create a new chat session for the authenticated user
            const firstUserMessage = guestSession.messages.find(m => m.sender === 'user');
            if (!firstUserMessage) return;
            
            // Create a new chat session
            const newSessionId = await createChatSession(firstUserMessage);
            
            if (newSessionId) {
              // Upload all messages from the guest session
              for (const msg of guestSession.messages) {
                if (msg.sender === 'user') {
                  await storeUserMessage(msg, newSessionId);
                } else {
                  await storeAIMessage(msg, newSessionId);
                }
              }
              
              // Set the current chat to the new session
              setChatId(newSessionId);
              
              // Clear the guest session
              clearGuestSession();
              
              console.log('Guest session synchronized to user account');
              
              return {
                chatId: newSessionId,
                messages: guestSession.messages,
                messageHistory: guestSession.messageHistory
              };
            }
          } catch (error) {
            console.error('Error syncing guest session:', error);
          }
        }
      }
      return null;
    };
    
    syncGuestSession();
  }, [user, isGuestSessionLoaded]);
  
  // Load initial messages - don't show loading state for homepage
  useEffect(() => {
    let isMounted = true;
    
    const loadMessages = async () => {
      try {
        const { data: session } = await supabase.auth.getSession();
        
        // Handle guest user - check if we have a saved session
        if (!session.session?.user) {
          if (hasGuestSession()) {
            const guestSession = loadGuestSession();
            if (guestSession && isMounted) {
              setChatId(guestSession.chatId);
              return {
                messages: guestSession.messages,
                messageHistory: guestSession.messageHistory
              };
            }
          }
          
          // No existing guest session, create a new chat ID
          setChatId(generateGuestChatId());
          return { messages: [], messageHistory: [] };
        }
        
        // Handle logged in user
        const chatSession = await fetchLastChatSession();
        
        if (chatSession && isMounted) {
          setChatId(chatSession.id);
          
          // Load messages for this session
          const chatMessages = await fetchChatMessages(chatSession.id);
          
          if (chatMessages && chatMessages.length > 0 && isMounted) {
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
        } else if (isMounted) {
          // No existing chat session found, create a new chat ID
          setChatId(nanoid());
        }
        
        return { messages: [], messageHistory: [] };
      } catch (error) {
        console.error("Error in loadMessages:", error);
        if (isMounted) {
          setChatId(nanoid()); // Fallback to a new chat ID
        }
        return { messages: [], messageHistory: [] };
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    
    setIsLoading(true);
    loadMessages();
    
    return () => {
      isMounted = false;
    };
  }, [user]); // Added user as a dependency to reload when auth changes
  
  const loadChatById = async (id: string) => {
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
  };
  
  return {
    chatId,
    setChatId,
    isLoading,
    loadChatById,
    saveGuestSession
  };
};
