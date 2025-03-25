
import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useChatMessages } from './useChatMessages';
import { useMessageSender } from './useMessageSender';
import { useAuth } from '@/context/AuthContext';
import { useChatDatabase } from './useChatDatabase';
import { useToast } from '@/hooks/use-toast';
import { isValidUUID } from '@/utils/uuid';
import { useMessageInput } from './useMessageInput';
import { useSuggestedPrompts } from './useSuggestedPrompts';
import { useVehicleContext } from './useVehicleContext';

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
    isLoading: messagesLoading,
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
    vehicleContext: senderVehicleContext
  } = useMessageSender();

  // Get vehicle context management
  const {
    vehicleContext,
    setAndLockVehicleContext,
    resetVehicleContextLock,
    isVehicleLocked
  } = useVehicleContext();

  // Get input state functionality
  const {
    input,
    setInput,
    hasAskedForVehicle,
    setHasAskedForVehicle
  } = useMessageInput();

  // Get suggested prompts
  const { suggestedPrompts } = useSuggestedPrompts();
  
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
      
      // Reset vehicle context lock for new chat
      resetVehicleContextLock();
      
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
  }, [isCreatingChat, resetChat, resetVehicleContextLock, user, createChatSession, setChatId, navigate, toast]);
  
  // Check if user can create a new chat (not processing a message)
  const canCreateNewChat = !isProcessing && !isCreatingChat;

  // Handle sending message form submission
  const handleSendMessage = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isProcessing && !messagesLoading) {
      processAndSendMessage(input);
      setInput('');
    }
  }, [input, isProcessing, messagesLoading, processAndSendMessage, setInput]);

  // Handle image upload
  const handleImageUpload = useCallback((file: File) => {
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      processAndSendMessage(input, imageUrl);
      setInput('');
    }
  }, [input, processAndSendMessage, setInput]);

  // Handle listing analysis
  const handleListingAnalysis = useCallback((url: string) => {
    if (url) {
      processAndSendMessage(`Can you analyze this vehicle listing? ${url}`);
      setInput('');
    }
  }, [processAndSendMessage, setInput]);

  // Handle suggested prompt selection
  const handleSuggestedPrompt = useCallback((prompt: string) => {
    setInput(prompt);
  }, [setInput]);
  
  // Manually set vehicle context (for direct vehicle selection)
  const setVehicle = useCallback((vehicle: any) => {
    if (vehicle) {
      console.log("Manually setting vehicle context:", vehicle);
      setAndLockVehicleContext(vehicle);
      toast({
        title: "Vehicle Selected",
        description: `Using ${vehicle.year} ${vehicle.make} ${vehicle.model} for this chat.`,
      });
    }
  }, [setAndLockVehicleContext, toast]);
  
  // Clear locked vehicle context
  const clearVehicleContext = useCallback(() => {
    resetVehicleContextLock();
    toast({
      title: "Vehicle Context Cleared",
      description: "You can now specify a different vehicle.",
    });
  }, [resetVehicleContextLock, toast]);
  
  return {
    messages,
    messageHistory,
    chatId,
    isLoading: messagesLoading || isProcessing,
    isProcessing,
    vehicleContext: senderVehicleContext || vehicleContext,
    input,
    setInput,
    processAndSendMessage,
    handleNewChat,
    canCreateNewChat,
    loadChatById,
    chatIdLoaded,
    handleSendMessage,
    handleImageUpload,
    handleListingAnalysis,
    handleSuggestedPrompt,
    suggestedPrompts,
    hasAskedForVehicle,
    setVehicle,
    clearVehicleContext,
    isVehicleLocked
  };
};
