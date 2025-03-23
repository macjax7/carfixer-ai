
import { useState, useEffect, useCallback } from 'react';
import { nanoid } from 'nanoid';
import { Message } from '@/components/chat/types';
import { ChatMessage } from '@/utils/openai/types';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

export const useChatMessages = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageHistory, setMessageHistory] = useState<string[]>([]);
  const [chatId, setChatId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  
  // Load messages from database if user is logged in
  useEffect(() => {
    const loadMessages = async () => {
      try {
        const { data: session } = await supabase.auth.getSession();
        if (!session.session?.user) {
          // If no user is logged in, just create a new chat ID
          setChatId(nanoid());
          return;
        }
        
        setIsLoading(true);
        
        // Get the most recent chat session
        const { data: chatSession, error: sessionError } = await supabase
          .from('chat_sessions')
          .select('*')
          .eq('user_id', session.session.user.id)
          .order('updated_at', { ascending: false })
          .limit(1)
          .single();
        
        if (sessionError && sessionError.code !== 'PGRST116') {
          console.error("Error loading chat session:", sessionError);
          setChatId(nanoid());
          setIsLoading(false);
          return;
        }
        
        if (chatSession) {
          setChatId(chatSession.id);
          
          // Load messages for this session
          const { data: chatMessages, error: messagesError } = await supabase
            .from('chat_messages')
            .select('*')
            .eq('session_id', chatSession.id)
            .order('created_at', { ascending: true });
          
          if (messagesError) {
            console.error("Error loading chat messages:", messagesError);
            setIsLoading(false);
            return;
          }
          
          if (chatMessages && chatMessages.length > 0) {
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
        } else {
          // No existing chat session found, create a new chat ID
          setChatId(nanoid());
        }
      } catch (error) {
        console.error("Error in loadMessages:", error);
        setChatId(nanoid()); // Fallback to a new chat ID
      } finally {
        setIsLoading(false);
      }
    };
    
    loadMessages();
    
    // Set up subscription for real-time chat message updates
    const setupMessageSubscription = async () => {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session?.user) return null;
      
      const subscription = supabase
        .channel('chat-messages-changes')
        .on('postgres_changes', 
          { 
            event: 'INSERT', 
            schema: 'public', 
            table: 'chat_messages',
          }, 
          (payload) => {
            // Only update if the message is for the current chat session
            if (payload.new && payload.new.session_id === chatId) {
              const newMsg = {
                id: payload.new.id,
                sender: payload.new.role === 'user' ? 'user' as const : 'ai' as const,
                text: payload.new.content,
                timestamp: new Date(payload.new.created_at),
                image: payload.new.image_url
              };
              
              setMessages(prevMessages => {
                // Check if the message is already in the array to avoid duplicates
                if (!prevMessages.some(msg => msg.id === newMsg.id)) {
                  return [...prevMessages, newMsg];
                }
                return prevMessages;
              });
              
              if (payload.new.role === 'user') {
                setMessageHistory(prev => [...prev, payload.new.content]);
              }
            }
          }
        )
        .subscribe();
        
      return subscription;
    };
    
    const subscriptionPromise = setupMessageSubscription();
    
    return () => {
      // Clean up subscription
      subscriptionPromise.then(sub => {
        if (sub) {
          supabase.removeChannel(sub);
        }
      });
    };
  }, [user?.id]); // Only depend on user.id to prevent re-running on every render
  
  const addUserMessage = useCallback((messageData: Message) => {
    setMessages(prevMessages => [...prevMessages, messageData]);
    setMessageHistory(prev => [...prev, messageData.text]);
    
    // Store the message in the database if user is logged in
    (async () => {
      try {
        const { data: session } = await supabase.auth.getSession();
        if (session.session?.user && chatId) {
          await supabase
            .from('chat_messages')
            .insert({
              id: messageData.id,
              session_id: chatId,
              role: 'user',
              content: messageData.text,
              image_url: messageData.image
            });
        }
      } catch (error) {
        console.error("Error storing user message:", error);
      }
    })();
    
    return messageData;
  }, [chatId]);
  
  const addAIMessage = useCallback((messageData: Message) => {
    setMessages(prev => [...prev, messageData]);
    
    // Store AI response in the database if user is logged in
    (async () => {
      try {
        const { data: session } = await supabase.auth.getSession();
        if (session.session?.user && chatId) {
          await supabase
            .from('chat_messages')
            .insert({
              id: messageData.id,
              session_id: chatId,
              role: 'assistant',
              content: messageData.text
            });
        }
      } catch (error) {
        console.error("Error storing AI message:", error);
      }
    })();
    
    return messageData;
  }, [chatId]);
  
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
    setChatId(nanoid()); // Generate a new chat ID for the new conversation
  }, []);
  
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
