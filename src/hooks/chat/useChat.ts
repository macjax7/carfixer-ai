import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useChatMessages } from './useChatMessages';
import { useMessageSender } from './useMessageSender';
import { useAuth } from '@/context/AuthContext';
import { useChatDatabase } from './useChatDatabase';
import { useToast } from '@/hooks/use-toast';
import { isValidUUID } from '@/utils/uuid';

export const useChat = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isCreatingChat, setIsCreatingChat] = useState(false);
  
  // Get chat state and message handling functions
  const {
    messages,
    messageHistory,
    chatId,
    isLoading,
    addUserMessage,
    addAIMessage,
    resetChat,
    setChatId,
    loadChatById,
    chatIdLoaded
  } = useChatMessages();
  
  // Get message sending functionality
  const {
    processAndSendMessage,
    isProcessing,
    vehicleContext
  } = useMessageSender();
  
  // Get database operations
  const { createChatSession } = useChatDatabase();
  
  // Create a new chat and navigate to it
  const handleNewChat = useCallback(async () => {
    if (isCreatingChat) {
      console.log("Already creating a new chat, ignoring duplicate request");
      return;
    }
    
    setIsCreatingChat(true);
    console.log("Creating new chat");
    
    try {
      // Reset the chat state and get new chat ID
      const newChatId = resetChat();
      console.log("New chat created with ID:", newChatId);
      
      // For authenticated users, create a session in the database
      if (user && user.id) {
        console.log("Creating database session for authenticated user");
        const dbChatId = await createChatSession("New Chat", user.id);
        
        if (dbChatId && isValidUUID(dbChatId)) {
          console.log("Using database-generated chat ID:", dbChatId);
          setChatId(dbChatId);
          navigate(`/chat/${dbChatId}`);
        } else {
          console.log("Using locally-generated chat ID:", newChatId);
          navigate(`/chat/${newChatId}`);
        }
      } else {
        // For guest users, just navigate to the new chat
        console.log("Guest user - using locally-generated chat ID");
        navigate(`/chat/${newChatId}`);
      }
    } catch (error) {
      console.error("Error creating new chat:", error);
      toast({
        title: "Error",
        description: "Failed to create a new chat. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsCreatingChat(false);
    }
  }, [isCreatingChat, resetChat, user, createChatSession, setChatId, navigate, toast]);
  
  // Check if user can create a new chat (not processing a message)
  const canCreateNewChat = !isProcessing && !isCreatingChat;
  
  return {
    messages,
    messageHistory,
    chatId,
    isLoading,
    isProcessing,
    vehicleContext,
    processAndSendMessage,
    handleNewChat,
    canCreateNewChat,
    loadChatById,
    chatIdLoaded
  };
};
