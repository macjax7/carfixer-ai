
import { useState, useEffect, useCallback } from 'react';
import { nanoid } from 'nanoid';
import { Message } from '@/components/chat/types';
import { ChatMessage } from '@/utils/openai/types';
import { useChatStorage } from './useChatStorage';
import { useChatSubscription } from './useChatSubscription';
import { UseChatMessagesResult } from './types';
import { supabase } from '@/integrations/supabase/client';
import { useGuestSession } from './useGuestSession';
import { useAuth } from '@/context/AuthContext';

export const useChatMessages = (): UseChatMessagesResult => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageHistory, setMessageHistory] = useState<string[]>([]);
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
    storeUserMessage,
    storeAIMessage,
    fetchLastChatSession,
    fetchChatMessages
  } = useChatStorage(chatId, setChatId);
  
  // Set up subscription to real-time updates
  useChatSubscription({
    chatId,
    setMessages,
    setMessageHistory
  });
  
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
              setMessages(guestSession.messages);
              setMessageHistory(guestSession.messageHistory);
              
              // Clear the guest session
              clearGuestSession();
              
              console.log('Guest session synchronized to user account');
            }
          } catch (error) {
            console.error('Error syncing guest session:', error);
          }
        }
      }
    };
    
    syncGuestSession();
  }, [user, isGuestSessionLoaded]);
  
  // Auto-save guest session when messages change
  useEffect(() => {
    if (!user && chatId && messages.length > 0) {
      saveGuestSession(chatId, messages, messageHistory);
    }
  }, [user, messages, messageHistory, chatId]);
  
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
            if (guestSession) {
              setChatId(guestSession.chatId);
              setMessages(guestSession.messages);
              setMessageHistory(guestSession.messageHistory);
              return;
            }
          }
          
          // No existing guest session, create a new chat ID
          setChatId(generateGuestChatId());
          return;
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
            
            setMessages(formattedMessages);
            
            // Update message history with user messages
            const userMsgHistory = chatMessages
              .filter(msg => msg.role === 'user')
              .map(msg => msg.content);
            
            setMessageHistory(userMsgHistory);
          }
        } else if (isMounted) {
          // No existing chat session found, create a new chat ID
          setChatId(nanoid());
        }
      } catch (error) {
        console.error("Error in loadMessages:", error);
        if (isMounted) {
          setChatId(nanoid()); // Fallback to a new chat ID
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    
    loadMessages();
    
    return () => {
      isMounted = false;
    };
  }, [user]); // Added user as a dependency to reload when auth changes
  
  const addUserMessage = useCallback((messageData: Message) => {
    setMessages(prevMessages => [...prevMessages, messageData]);
    setMessageHistory(prev => [...prev, messageData.text]);
    
    // Store the message in the database if user is logged in
    if (chatId && user) {
      storeUserMessage(messageData, chatId);
    }
    
    return messageData;
  }, [chatId, storeUserMessage, user]);
  
  const addAIMessage = useCallback((messageData: Message) => {
    setMessages(prev => [...prev, messageData]);
    
    // Store AI response in the database if user is logged in
    if (chatId && user) {
      storeAIMessage(messageData, chatId);
    }
    
    return messageData;
  }, [chatId, storeAIMessage, user]);
  
  const getMessagesForAPI = useCallback((userMessage: Message): ChatMessage[] => {
    return messages
      .concat(userMessage)
      .map(msg => ({
        role: msg.sender === 'user' ? 'user' as const : 'assistant' as const,
        content: msg.text
      }));
  }, [messages]);
  
  // Enhanced resetChat function that properly clears the chat and generates a new ID
  const resetChat = useCallback(() => {
    // In a complete implementation, we would save the messages to history here
    setMessages([]);
    setMessageHistory([]);
    const newChatId = nanoid();
    setChatId(newChatId);
    
    // If user is not logged in, clear the guest session
    if (!user) {
      clearGuestSession();
    }
  }, [user]);
  
  const addMessage = useCallback((message: Message) => {
    setMessages(prev => [...prev, message]);
    if (message.sender === 'user') {
      setMessageHistory(prev => [...prev, message.text]);
    }
  }, []);
  
  return {
    messages,
    messageHistory,
    chatId,
    isLoading,
    addUserMessage,
    addAIMessage,
    getMessagesForAPI,
    resetChat,
    addMessage,
    setChatId
  };
};
