
import { useState, useEffect } from 'react';
import { nanoid } from 'nanoid';
import { Message } from '@/components/chat/types';
import { ChatMessage } from '@/utils/openai';
import { supabase } from '@/integrations/supabase/client';

export const useChatMessages = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageHistory, setMessageHistory] = useState<string[]>([]);
  const [chatId, setChatId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Load messages from database if user is logged in
  useEffect(() => {
    const loadMessages = async () => {
      try {
        const { data: session } = await supabase.auth.getSession();
        if (!session.session?.user) return;
        
        setIsLoading(true);
        
        // Get the most recent chat session
        const { data: chatSession, error: sessionError } = await supabase
          .from('chat_sessions')
          .select('*')
          .order('updated_at', { ascending: false })
          .limit(1)
          .single();
        
        if (sessionError && sessionError.code !== 'PGRST116') {
          console.error("Error loading chat session:", sessionError);
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
            return;
          }
          
          if (chatMessages && chatMessages.length > 0) {
            const formattedMessages = chatMessages.map(msg => ({
              id: msg.id,
              sender: msg.role as 'user' | 'ai',
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
      } finally {
        setIsLoading(false);
      }
    };
    
    loadMessages();
    
    // Listen for changes to the auth state
    const { data: authListener } = supabase.auth.onAuthStateChange((_, session) => {
      if (session) {
        loadMessages();
      } else {
        // Clear messages when user logs out
        setMessages([]);
        setMessageHistory([]);
        setChatId(nanoid());
      }
    });
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);
  
  const addUserMessage = (text: string, image?: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text,
      timestamp: new Date(),
      image
    };
    
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setMessageHistory(prev => [...prev, text]);
    
    return userMessage;
  };
  
  const addAIMessage = (text: string, options?: {
    vehicleListingAnalysis?: Message['vehicleListingAnalysis'];
    componentDiagram?: Message['componentDiagram'];
  }) => {
    const aiMessage: Message = {
      id: nanoid(),
      sender: 'ai',
      text,
      timestamp: new Date(),
      ...options
    };
    
    setMessages(prev => [...prev, aiMessage]);
    return aiMessage;
  };
  
  const getMessagesForAPI = (userMessage: Message): ChatMessage[] => {
    return messages
      .concat(userMessage)
      .map(msg => ({
        role: msg.sender === 'user' ? 'user' as const : 'assistant' as const,
        content: msg.text
      }));
  };
  
  // Enhanced resetChat function that properly clears the chat and generates a new ID
  const resetChat = () => {
    // In a complete implementation, we would save the messages to history here
    setMessages([]);
    setMessageHistory([]);
    setChatId(nanoid()); // Generate a new chat ID for the new conversation
  };
  
  return {
    messages,
    messageHistory,
    chatId,
    isLoading,
    addUserMessage,
    addAIMessage,
    getMessagesForAPI,
    resetChat
  };
};
