
import { useState, useCallback, useEffect } from "react";
import { Message } from "@/components/chat/types";
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useChatId } from "./handlers/useChatId";
import { useChatStorage } from "./handlers/useChatStorage";
import { useChatMessaging } from "./handlers/useChatMessaging";
import { useRealtimeMessages } from "./handlers/useRealtimeMessages";
import { useMessageLoading } from "./handlers/useMessageLoading";
import { supabase } from '@/integrations/supabase/client';

export const useDirectChatHandler = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [chatId, setChatId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const { user } = useAuth();
  const { toast } = useToast();
  const { generateChatId, isValidUUID } = useChatId();
  const { createChatSession, updateChatTitle, storeMessage } = useChatStorage();
  const { isProcessing, createUserMessage, createAIMessage, processMessage } = useChatMessaging();
  const { loadMessages } = useMessageLoading();
  
  const addMessage = useCallback((message: Message) => {
    setMessages(prev => [...prev, message]);
  }, []);
  
  const { hasProcessedMessage, markMessageProcessed } = useRealtimeMessages(chatId, addMessage);

  useEffect(() => {
    const initializeChat = async () => {
      if (user) {
        try {
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
            
            const loadedMessages = await loadMessages(data[0].id);
            setMessages(loadedMessages);
          } else {
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
          
          const fallbackId = generateChatId(true);
          setChatId(fallbackId);
        }
      } else {
        const guestId = generateChatId(false);
        setChatId(guestId);
      }
    };
    
    if (!chatId) {
      initializeChat();
    }
  }, [user, toast, chatId, generateChatId, loadMessages]);
  
  const resetChat = useCallback(async () => {
    setMessages([]);
    
    if (user) {
      try {
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
        return newId;
      } catch (error) {
        console.error("Error creating new chat session:", error);
        
        const fallbackId = generateChatId(true);
        setChatId(fallbackId);
        return fallbackId;
      }
    } else {
      const guestId = generateChatId(false);
      setChatId(guestId);
      return guestId;
    }
  }, [user, generateChatId, setChatId]);
  
  const loadChatById = useCallback(async (id: string) => {
    if (!id) return;
    
    try {
      console.log("Loading chat:", id);
      
      setIsLoading(true);
      
      setMessages([]);
      
      setChatId(id);
      
      const loadedMessages = await loadMessages(id);
      
      if (loadedMessages.length === 0) {
        if (user) {
          const { count } = await supabase
            .from('chat_sessions')
            .select('*', { count: 'exact' })
            .eq('id', id)
            .eq('user_id', user.id);
            
          if (count === 0) {
            throw new Error('Chat session not found or access denied');
          }
        }
      }
      
      setMessages(loadedMessages);
    } catch (error) {
      console.error("Error loading chat:", error);
      toast({
        title: "Error loading chat",
        description: "Unable to load the selected conversation. The chat may not exist or you may not have access to it.",
        variant: "destructive"
      });
      
      resetChat();
    } finally {
      setIsLoading(false);
    }
  }, [loadMessages, user, toast, resetChat]);
  
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
      const { userMessage, aiMessage } = await processMessage(text, image, messages.slice(-10));
      
      markMessageProcessed(userMessage.id);
      markMessageProcessed(aiMessage.id);
      
      addMessage(userMessage);
      
      if (user && isValidUUID(chatId)) {
        await storeMessage(chatId, userMessage.id, userMessage.text, 'user', userMessage.image);
      }
      
      addMessage(aiMessage);
      
      if (user && isValidUUID(chatId)) {
        await storeMessage(chatId, aiMessage.id, aiMessage.text, 'assistant');
        
        if (messages.length <= 1 && user) {
          await updateChatTitle(chatId, user.id, text.substring(0, 50));
        }
      }
      
      setInput('');
    } catch (error) {
      console.error("Error in sendMessage:", error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
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
    isLoading,
    sendMessage,
    chatId,
    resetChat,
    loadChatById
  };
};
