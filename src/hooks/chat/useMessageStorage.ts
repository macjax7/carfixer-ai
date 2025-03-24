
import { useCallback } from 'react';
import { Message } from '@/components/chat/types';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { v4 as uuidv4 } from 'uuid';
import { useToast } from '@/hooks/use-toast';

export const useMessageStorage = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const storeUserMessage = useCallback(async (messageData: Message, sessionId: string) => {
    if (!user || !sessionId) {
      console.log("Cannot store user message: missing user or sessionId", { hasUser: !!user, sessionId });
      return;
    }

    try {
      console.log(`Storing user message to database:`, { message: messageData, sessionId });
      
      // Generate a proper UUID for the message
      const messageId = messageData.id || uuidv4();
      
      // Ensure sessionId is a valid UUID
      const isValidUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(sessionId);
      if (!isValidUUID) {
        console.error("Invalid UUID format for sessionId:", sessionId);
        toast({
          title: "Storage Error",
          description: "Invalid session format. Please refresh the page.",
          variant: "destructive"
        });
        return;
      }
      
      const { error } = await supabase
        .from('chat_messages')
        .insert({
          id: messageId,
          session_id: sessionId,
          role: 'user',
          content: messageData.text,
          image_url: messageData.image
        });
        
      if (error) {
        console.error("Error storing user message:", error);
        return;
      }
        
      console.log('Successfully stored user message with ID:', messageId);
    } catch (error) {
      console.error("Error storing user message:", error);
    }
  }, [user, toast]);

  const storeAIMessage = useCallback(async (messageData: Message, sessionId: string) => {
    if (!user || !sessionId) {
      console.log("Cannot store AI message: missing user or sessionId", { hasUser: !!user, sessionId });
      return;
    }

    try {
      console.log(`Storing AI message to database:`, { message: messageData, sessionId });
      
      // Generate a proper UUID for the message
      const messageId = messageData.id || uuidv4();
      
      // Ensure sessionId is a valid UUID
      const isValidUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(sessionId);
      if (!isValidUUID) {
        console.error("Invalid UUID format for sessionId:", sessionId);
        return;
      }
      
      const { error } = await supabase
        .from('chat_messages')
        .insert({
          id: messageId,
          session_id: sessionId,
          role: 'assistant',
          content: messageData.text
        });
        
      if (error) {
        console.error("Error storing AI message:", error);
        return;
      }
        
      console.log('Successfully stored AI message with ID:', messageId);
    } catch (error) {
      console.error("Error storing AI message:", error);
    }
  }, [user]);

  // Add the fetchChatMessages function
  const fetchChatMessages = useCallback(async (sessionId: string) => {
    if (!sessionId) {
      console.error("Cannot fetch messages: missing sessionId");
      return [];
    }
    
    try {
      console.log(`Fetching messages for chat session:`, sessionId);
      
      // Ensure sessionId is a valid UUID
      const isValidUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(sessionId);
      if (!isValidUUID) {
        console.error("Invalid UUID format for sessionId in fetchChatMessages:", sessionId);
        return [];
      }
      
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });
        
      if (error) {
        console.error("Error fetching chat messages:", error);
        return [];
      }
      
      console.log(`Retrieved ${data?.length || 0} messages for session ${sessionId}`);
      
      // Map database messages to the application Message format
      const messages = data?.map(msg => ({
        id: msg.id,
        sender: msg.role === 'user' ? 'user' : 'ai',
        text: msg.content,
        timestamp: new Date(msg.created_at),
        image: msg.image_url
      })) || [];
      
      return messages;
    } catch (error) {
      console.error("Error in fetchChatMessages:", error);
      return [];
    }
  }, []);

  return {
    storeUserMessage,
    storeAIMessage,
    fetchChatMessages
  };
};
