
import { useState, useCallback, useEffect } from "react";
import { Message } from "@/components/chat/types";
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useChatId } from "./handlers/useChatId";
import { useChatStorage } from "./handlers/useChatStorage";
import { useChatMessaging } from "./handlers/useChatMessaging";
import { useRealtimeMessages } from "./handlers/useRealtimeMessages";
import { useMessageLoading } from "./handlers/useMessageLoading";

export const useDirectChatHandler = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [chatId, setChatId] = useState<string | null>(null);
  
  const { user } = useAuth();
  const { toast } = useToast();
  const { generateChatId, isValidUUID } = useChatId();
  const { createChatSession, updateChatTitle, storeMessage } = useChatStorage();
  const { isProcessing, createUserMessage, createAIMessage, processMessage } = useChatMessaging();
  const { loadMessages } = useMessageLoading();
  
  // Add new message to state
  const addMessage = useCallback((message: Message) => {
    setMessages(prev => [...prev, message]);
  }, []);
  
  // Set up realtime messaging
  const { hasProcessedMessage, markMessageProcessed } = useRealtimeMessages(chatId, addMessage);

  // Initialize or retrieve chat session
  useEffect(() => {
    const initializeChat = async () => {
      // For logged-in users, try to find an existing session or create a new one
      if (user) {
        try {
          // Try to find the most recent chat
          const { data, error } = await supabase
            .from('chat_sessions')
            .select('*')
            .eq('user_id', user.id)
            .order('updated_at', { ascending: false })
            .limit(1);
            
          if (error) throw error;
          
          if (data && data.length > 0) {
            console.log("Found existing chat session:", data[0].id);
            setChatId(data[0].id);
            
            // Load messages for this chat
            const loadedMessages = await loadMessages(data[0].id);
            setMessages(loadedMessages);
          } else {
            // Create a new chat session
            const newId = generateChatId(true);
            const { error: insertError } = await supabase
              .from('chat_sessions')
              .insert({
                id: newId,
                user_id: user.id,
                title: 'New Chat'
              });
              
            if (insertError) throw insertError;
            
            console.log("Created new chat session:", newId);
            setChatId(newId);
          }
        } catch (error) {
          console.error("Error initializing chat:", error);
          toast({
            title: "Error initializing chat",
            description: "Failed to set up chat session",
            variant: "destructive"
          });
          
          // Fallback to local ID
          const fallbackId = generateChatId(true);
          setChatId(fallbackId);
        }
      } else {
        // For guests, just generate a local ID
        const guestId = generateChatId(false);
        setChatId(guestId);
      }
    };
    
    if (!chatId) {
      initializeChat();
    }
  }, [user, toast, chatId, generateChatId, loadMessages]);
  
  // Reset chat
  const resetChat = useCallback(async () => {
    // Clear messages
    setMessages([]);
    
    // For logged-in users, create a new chat session
    if (user) {
      try {
        // Create a new chat session
        const newId = generateChatId(true);
        const { error } = await supabase
          .from('chat_sessions')
          .insert({
            id: newId,
            user_id: user.id,
            title: 'New Chat'
          });
          
        if (error) throw error;
        
        console.log("Created new chat session:", newId);
        setChatId(newId);
      } catch (error) {
        console.error("Error creating new chat session:", error);
        
        // Fallback to local ID
        const fallbackId = generateChatId(true);
        setChatId(fallbackId);
      }
    } else {
      // For guests, just generate a new local ID
      const guestId = generateChatId(false);
      setChatId(guestId);
    }
    
    return chatId;
  }, [user, chatId, generateChatId]);
  
  // Load chat by ID
  const loadChatById = useCallback(async (id: string) => {
    if (!id) return;
    
    try {
      console.log("Loading chat:", id);
      
      // Clear current messages
      setMessages([]);
      
      // Set the chat ID
      setChatId(id);
      
      // Load messages for this chat
      const loadedMessages = await loadMessages(id);
      setMessages(loadedMessages);
    } catch (error) {
      console.error("Error loading chat:", error);
    }
  }, [loadMessages]);
  
  // Send a message
  const sendMessage = useCallback(async (text: string, image?: string) => {
    if (!text.trim() && !image) return;
    if (!chatId) {
      toast({
        title: "Error",
        description: "Chat session not initialized",
        variant: "destructive"
      });
      return;
    }
    
    try {
      // Process the message and get both user and AI messages
      const { userMessage, aiMessage } = await processMessage(text, image, messages.slice(-10));
      
      // Mark both messages as processed to avoid duplication via realtime updates
      markMessageProcessed(userMessage.id);
      markMessageProcessed(aiMessage.id);
      
      // Add user message to UI
      addMessage(userMessage);
      
      // For authenticated users with valid UUID chatId, save message to database
      if (user && isValidUUID(chatId)) {
        await storeMessage(chatId, userMessage.id, userMessage.text, 'user', userMessage.image);
      }
      
      // Add AI message to UI
      addMessage(aiMessage);
      
      // For authenticated users with valid UUID chatId, save AI message to database
      if (user && isValidUUID(chatId)) {
        await storeMessage(chatId, aiMessage.id, aiMessage.text, 'assistant');
        
        // Update the chat session title if this is the first message
        if (messages.length <= 1 && user) {
          await updateChatTitle(chatId, user.id, text.substring(0, 50));
        }
      }
      
      // Clear input
      setInput('');
    } catch (error) {
      console.error("Error in sendMessage:", error);
    }
  }, [
    chatId, 
    messages, 
    user, 
    toast, 
    isValidUUID, 
    processMessage, 
    addMessage, 
    markMessageProcessed, 
    storeMessage, 
    updateChatTitle
  ]);

  return {
    messages,
    input,
    setInput,
    isProcessing,
    sendMessage,
    chatId,
    resetChat,
    loadChatById
  };
};

// Import needed for Supabase in useEffect
import { supabase } from '@/integrations/supabase/client';
