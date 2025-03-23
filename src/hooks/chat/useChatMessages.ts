
import { useState, useEffect, useCallback } from 'react';
import { nanoid } from 'nanoid';
import { Message } from '@/components/chat/types';
import { ChatMessage } from '@/utils/openai';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from '@/context/AuthContext';

export const useChatMessages = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'ai',
      text: "Hello! I'm your CarFix AI assistant. How can I help with your vehicle today?",
      timestamp: new Date()
    }
  ]);
  
  const [messageHistory, setMessageHistory] = useState<string[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const { user } = useAuth();
  
  // Create a new chat session
  const createChatSession = useCallback(async () => {
    if (!user) return null;
    
    try {
      const { data, error } = await supabase
        .from('chat_sessions')
        .insert([
          { user_id: user.uid, title: 'New Chat' }
        ])
        .select()
        .single();
        
      if (error) throw error;
      setCurrentSessionId(data.id);
      return data.id;
    } catch (error) {
      console.error('Error creating chat session:', error);
      return null;
    }
  }, [user]);
  
  // Fetch chat session or create a new one if none exists
  useEffect(() => {
    const initializeSession = async () => {
      if (!user) return;
      
      try {
        // Check for existing sessions
        const { data, error } = await supabase
          .from('chat_sessions')
          .select('*')
          .eq('user_id', user.uid)
          .order('updated_at', { ascending: false })
          .limit(1);
          
        if (error) throw error;
        
        if (data && data.length > 0) {
          setCurrentSessionId(data[0].id);
          
          // Fetch messages for this session
          const { data: messagesData, error: messagesError } = await supabase
            .from('chat_messages')
            .select('*')
            .eq('session_id', data[0].id)
            .order('created_at', { ascending: true });
            
          if (messagesError) throw messagesError;
          
          if (messagesData && messagesData.length > 0) {
            // Convert Supabase messages to our Message format
            const formattedMessages = messagesData.map(msg => ({
              id: msg.id,
              sender: msg.role === 'user' ? 'user' as const : 'ai' as const,
              text: msg.content,
              timestamp: new Date(msg.created_at),
              image: msg.image_url
            }));
            
            // Add welcome message at the beginning
            setMessages([messages[0], ...formattedMessages]);
            
            // Update message history
            setMessageHistory(formattedMessages
              .filter(msg => msg.sender === 'user')
              .map(msg => msg.text));
          }
        } else {
          // No existing sessions, create a new one
          await createChatSession();
        }
      } catch (error) {
        console.error('Error initializing chat session:', error);
      }
    };
    
    initializeSession();
  }, [user, createChatSession]);
  
  const addUserMessage = async (text: string, image?: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text,
      timestamp: new Date(),
      image
    };
    
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setMessageHistory(prev => [...prev, text]);
    
    // Save to Supabase if user is authenticated and session exists
    if (user && currentSessionId) {
      try {
        await supabase
          .from('chat_messages')
          .insert([
            {
              session_id: currentSessionId,
              content: text,
              role: 'user',
              image_url: image
            }
          ]);
          
        // Update session timestamp
        await supabase
          .from('chat_sessions')
          .update({ updated_at: new Date().toISOString() })
          .eq('id', currentSessionId);
      } catch (error) {
        console.error('Error saving user message:', error);
      }
    }
    
    return userMessage;
  };
  
  const addAIMessage = async (text: string, options?: {
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
    
    // Save to Supabase if user is authenticated and session exists
    if (user && currentSessionId) {
      try {
        await supabase
          .from('chat_messages')
          .insert([
            {
              session_id: currentSessionId,
              content: text,
              role: 'assistant'
              // Note: We don't save componentDiagram or vehicleListingAnalysis yet
              // This would require schema updates
            }
          ]);
      } catch (error) {
        console.error('Error saving AI message:', error);
      }
    }
    
    return aiMessage;
  };
  
  const getMessagesForAPI = (userMessage: Message): ChatMessage[] => {
    return messages
      .filter(msg => msg.id !== '1') // Filter out the welcome message
      .concat(userMessage)
      .map(msg => ({
        role: msg.sender === 'user' ? 'user' as const : 'assistant' as const,
        content: msg.text
      }));
  };
  
  return {
    messages,
    messageHistory,
    addUserMessage,
    addAIMessage,
    getMessagesForAPI,
    currentSessionId,
    createChatSession
  };
};
