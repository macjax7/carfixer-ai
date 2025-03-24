
import { useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Message } from '@/components/chat/types';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

export const useChatStorage = (chatId: string | null, onMessagesLoaded: (messages: Message[]) => void) => {
  const { user } = useAuth();
  const { toast } = useToast();

  // Store user message to the database
  const storeUserMessage = useCallback(async (messageData: Message, sessionId: string) => {
    if (!user) {
      console.log("Cannot store message: not authenticated");
      return;
    }

    // Ensure sessionId is a valid UUID
    const isValidUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(sessionId);
    if (!isValidUUID) {
      console.error("Invalid UUID format for sessionId:", sessionId);
      const validUuid = uuidv4();
      console.log("Created valid UUID instead:", validUuid);
      sessionId = validUuid;
    }

    try {
      console.log(`Storing user message to database:`, messageData);
      
      const { error } = await supabase
        .from('chat_messages')
        .insert({
          id: messageData.id,
          session_id: sessionId,
          role: 'user',
          content: messageData.text,
          image_url: messageData.image
        });
        
      if (error) {
        console.error("Error storing user message:", error);
        toast({
          title: "Storage Error",
          description: "Failed to save message to database",
          variant: "destructive"
        });
      } else {
        console.log("Successfully stored user message to database");
      }
    } catch (error) {
      console.error("Error in storeUserMessage:", error);
    }
  }, [user, toast]);

  // Store AI message to the database
  const storeAIMessage = useCallback(async (messageData: Message, sessionId: string) => {
    if (!user) {
      console.log("Cannot store AI message: not authenticated");
      return;
    }

    // Ensure sessionId is a valid UUID
    const isValidUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(sessionId);
    if (!isValidUUID) {
      console.error("Invalid UUID format for sessionId:", sessionId);
      const validUuid = uuidv4();
      console.log("Created valid UUID instead:", validUuid);
      sessionId = validUuid;
    }

    try {
      console.log(`Storing AI message to database:`, messageData);
      
      const { error } = await supabase
        .from('chat_messages')
        .insert({
          id: messageData.id,
          session_id: sessionId,
          role: 'assistant',
          content: messageData.text
        });
        
      if (error) {
        console.error("Error storing AI message:", error);
      } else {
        console.log("Successfully stored AI message to database");
      }
    } catch (error) {
      console.error("Error in storeAIMessage:", error);
    }
  }, [user]);

  // Create a chat session for a user message
  const createChatSession = useCallback(async (messageData: Message) => {
    if (!user) {
      console.log("Cannot create chat session: not authenticated");
      return null;
    }

    const newChatId = uuidv4();
    
    try {
      // Create a descriptive title based on the message content
      const title = messageData.text.length > 30 
        ? messageData.text.substring(0, 30) + '...' 
        : messageData.text;
        
      console.log("Creating new chat session with title:", title);
      
      const { error } = await supabase
        .from('chat_sessions')
        .insert({
          id: newChatId,
          user_id: user.id,
          title
        });
      
      if (error) {
        console.error('Error creating chat session:', error);
      } else {
        console.log('Successfully created chat session with ID:', newChatId);
      }
      
      return newChatId;
    } catch (error) {
      console.error('Error in createChatSession:', error);
      return newChatId; // Still return ID even if DB operation fails
    }
  }, [user]);

  // Fetch messages for a given chat
  const fetchChatMessages = useCallback(async (sessionId: string): Promise<Message[]> => {
    if (!sessionId) {
      console.error("Cannot fetch messages: missing sessionId");
      return [];
    }
    
    try {
      console.log(`Fetching messages for chat session:`, sessionId);
      
      // Ensure sessionId is a valid UUID
      const isValidUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(sessionId);
      if (!isValidUUID) {
        console.error("Invalid UUID format for sessionId:", sessionId);
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
      
      if (!data || data.length === 0) {
        console.log("No messages found for session:", sessionId);
        return [];
      }
      
      console.log(`Fetched ${data.length} messages for session:`, sessionId);
      
      // Map database messages to app Message format
      const messages: Message[] = data.map(msg => ({
        id: msg.id,
        sender: msg.role === 'user' ? 'user' : 'ai',
        text: msg.content,
        timestamp: new Date(msg.created_at),
        image: msg.image_url
      }));
      
      return messages;
    } catch (error) {
      console.error("Error in fetchChatMessages:", error);
      return [];
    }
  }, []);

  // Load messages for current chat
  const loadChatMessages = useCallback(async () => {
    if (!chatId) {
      console.log("Cannot load chat messages: no chatId");
      return [];
    }
    
    try {
      console.log("Loading chat messages for ID:", chatId);
      const messages = await fetchChatMessages(chatId);
      
      if (messages && messages.length > 0) {
        console.log(`Loaded ${messages.length} messages`);
        onMessagesLoaded(messages);
      } else {
        console.log("No messages found for chat ID:", chatId);
      }
      
      return messages;
    } catch (error) {
      console.error("Error loading chat messages:", error);
      return [];
    }
  }, [chatId, fetchChatMessages, onMessagesLoaded]);

  // Fetch the last chat session
  const fetchLastChatSession = useCallback(async () => {
    if (!user) {
      console.log("Cannot fetch last chat session: not authenticated");
      return null;
    }
    
    try {
      console.log("Fetching last chat session for user:", user.email);
      
      const { data, error } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          // This error means no rows were returned, which is not an error for us
          console.log("No previous chat sessions found for user");
          return null;
        }
        console.error("Error loading chat session:", error);
        return null;
      }
      
      console.log("Found last session:", data?.id);
      return data || null;
    } catch (error) {
      console.error("Error in fetchLastChatSession:", error);
      return null;
    }
  }, [user]);

  return {
    storeUserMessage,
    storeAIMessage,
    createChatSession,
    loadChatMessages,
    fetchChatMessages,
    fetchLastChatSession
  };
};
