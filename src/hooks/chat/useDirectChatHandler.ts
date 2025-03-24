
import { useState, useCallback, useEffect, useRef } from "react";
import { nanoid } from "nanoid";
import { supabase } from '@/integrations/supabase/client';
import { Message } from "@/components/chat/types";
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';
import { useOpenAI } from "@/utils/openai/hook";
import { ChatMessage } from "@/utils/openai/types";

export const useDirectChatHandler = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [chatId, setChatId] = useState<string | null>(null);
  const processedMessagesRef = useRef<Set<string>>(new Set());
  const { user } = useAuth();
  const { toast } = useToast();
  const { chatWithAI } = useOpenAI();

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
            loadMessages(data[0].id);
          } else {
            // Create a new chat session
            const newId = uuidv4();
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
          const fallbackId = uuidv4();
          setChatId(fallbackId);
        }
      } else {
        // For guests, just generate a local ID
        const guestId = nanoid();
        setChatId(guestId);
      }
    };
    
    if (!chatId) {
      initializeChat();
    }
  }, [user, toast, chatId]);
  
  // Load messages for a specific chat
  const loadMessages = useCallback(async (id: string) => {
    if (!id) return;
    
    try {
      console.log("Loading messages for chat:", id);
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('session_id', id)
        .order('created_at', { ascending: true });
        
      if (error) throw error;
      
      if (data && data.length > 0) {
        const formattedMessages: Message[] = data.map(msg => ({
          id: msg.id,
          sender: msg.role === 'user' ? 'user' : 'ai',
          text: msg.content,
          timestamp: new Date(msg.created_at),
          image: msg.image_url
        }));
        
        setMessages(formattedMessages);
        
        // Mark all loaded messages as processed
        formattedMessages.forEach(msg => {
          processedMessagesRef.current.add(msg.id);
        });
        
        console.log(`Loaded ${formattedMessages.length} messages for chat ${id}`);
      } else {
        // Clear messages if none found for this chat
        setMessages([]);
      }
    } catch (error) {
      console.error("Error loading messages:", error);
    }
  }, []);
  
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
      await loadMessages(id);
    } catch (error) {
      console.error("Error loading chat:", error);
    }
  }, [loadMessages]);
  
  // Reset chat
  const resetChat = useCallback(async () => {
    // Clear messages
    setMessages([]);
    
    // For logged-in users, create a new chat session
    if (user) {
      try {
        // Create a new chat session
        const newId = uuidv4();
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
        const fallbackId = uuidv4();
        setChatId(fallbackId);
      }
    } else {
      // For guests, just generate a new local ID
      const guestId = nanoid();
      setChatId(guestId);
    }
    
    // Reset processed messages
    processedMessagesRef.current = new Set();
    
    return chatId;
  }, [user, chatId]);
  
  // Set up real-time subscription for new messages
  useEffect(() => {
    if (!chatId || !user) return;
    
    // Only set up subscription for valid UUIDs (for database operations)
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(chatId)) {
      console.log("Not setting up subscription for non-UUID chat ID:", chatId);
      return;
    }
    
    console.log("Setting up real-time subscription for chat:", chatId);
    
    const channel = supabase
      .channel(`chat:${chatId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
        filter: `session_id=eq.${chatId}`,
      }, (payload) => {
        console.log("Received real-time message:", payload);
        
        if (payload.new) {
          const { id, content, role, image_url, created_at } = payload.new;
          
          // Skip if already processed
          if (processedMessagesRef.current.has(id)) {
            console.log("Skipping already processed message:", id);
            return;
          }
          
          processedMessagesRef.current.add(id);
          
          // Add message to UI
          const newMessage: Message = {
            id,
            sender: role === 'user' ? 'user' : 'ai',
            text: content || '',
            timestamp: new Date(created_at),
            image: image_url
          };
          
          setMessages(current => [...current, newMessage]);
        }
      })
      .subscribe((status) => {
        console.log("Subscription status:", status);
      });
      
    return () => {
      console.log("Cleaning up subscription");
      supabase.removeChannel(channel);
    };
  }, [chatId, user]);
  
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
    
    setIsProcessing(true);
    
    try {
      // Create a unique ID for the user message
      const userMessageId = uuidv4();
      
      // Create the user message object for UI
      const userMessage: Message = {
        id: userMessageId,
        sender: 'user',
        text,
        timestamp: new Date(),
        image
      };
      
      // Mark as processed
      processedMessagesRef.current.add(userMessageId);
      
      // Add user message to UI
      setMessages(prev => [...prev, userMessage]);
      
      // For authenticated users with valid UUID chatId, save message to database
      if (user && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(chatId)) {
        console.log("Storing user message to database:", userMessageId);
        
        const { error } = await supabase
          .from('chat_messages')
          .insert({
            id: userMessageId,
            session_id: chatId,
            role: 'user',
            content: text,
            image_url: image
          });
          
        if (error) {
          console.error("Error storing user message:", error);
          toast({
            title: "Error",
            description: "Failed to save your message",
            variant: "destructive"
          });
        }
      }
      
      // Process AI response
      try {
        console.log("Sending message to AI...");
        // Convert the message to the format expected by chatWithAI
        const chatMessages: ChatMessage[] = [{
          role: 'user',
          content: text
        }];
        
        // Use previous messages for context (limit to last 10 for performance)
        const contextMessages = messages.slice(-10);
        const previousMessages = contextMessages.map(msg => ({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.text
        })) as ChatMessage[];
        
        // Combine previous messages with current message
        const allMessages = [...previousMessages, ...chatMessages];
        
        const aiResponseText = await chatWithAI(allMessages);
        
        if (!aiResponseText) throw new Error("No response from AI");
        
        // Create AI message
        const aiMessageId = uuidv4();
        const aiMessage: Message = {
          id: aiMessageId,
          sender: 'ai',
          text: aiResponseText || "Sorry, I couldn't process your request",
          timestamp: new Date(),
        };
        
        // Mark as processed
        processedMessagesRef.current.add(aiMessageId);
        
        // Add AI message to UI
        setMessages(prev => [...prev, aiMessage]);
        
        // For authenticated users with valid UUID chatId, save AI message to database
        if (user && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(chatId)) {
          console.log("Storing AI message to database:", aiMessageId);
          
          const { error } = await supabase
            .from('chat_messages')
            .insert({
              id: aiMessageId,
              session_id: chatId,
              role: 'assistant',
              content: aiMessage.text
            });
            
          if (error) {
            console.error("Error storing AI message:", error);
          }
        }
        
        // Update the chat session title if this is the first message
        if (messages.length <= 2 && user) {
          updateChatTitle(text.substring(0, 50));
        }
      } catch (error) {
        console.error("Error processing AI response:", error);
        
        // Show error in chat
        const errorMessageId = uuidv4();
        const errorMessage: Message = {
          id: errorMessageId,
          sender: 'ai',
          text: "I'm sorry, I encountered an error processing your message. Please try again.",
          timestamp: new Date()
        };
        
        // Mark as processed
        processedMessagesRef.current.add(errorMessageId);
        
        setMessages(prev => [...prev, errorMessage]);
        
        toast({
          title: "Error",
          description: "Failed to get AI response",
          variant: "destructive"
        });
      }
    } finally {
      setIsProcessing(false);
      setInput('');
    }
  }, [chatId, messages, toast, user, chatWithAI]);
  
  // Update chat title
  const updateChatTitle = useCallback(async (title: string) => {
    if (!user || !chatId) return;
    
    try {
      const { error } = await supabase
        .from('chat_sessions')
        .update({ title: title.length > 50 ? title.substring(0, 47) + '...' : title })
        .eq('id', chatId);
        
      if (error) throw error;
    } catch (error) {
      console.error("Error updating chat title:", error);
    }
  }, [user, chatId]);
  
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
