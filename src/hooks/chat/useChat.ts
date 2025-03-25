
import { useCallback } from 'react';
import { useMessageHandlers } from './useMessageHandlers';
import { useSuggestedPrompts } from './useSuggestedPrompts';
import { useChatMessages } from './useChatMessages';
import { useNavigate } from 'react-router-dom';

export const useChat = () => {
  const {
    messages,
    input,
    setInput,
    isLoading,
    handleSendMessage,
    handleTextInput,
    handleImageUpload,
    handleListingAnalysis,
    handleSuggestedPrompt,
    hasAskedForVehicle,
    resetChat,
    saveCurrentChat,
    chatId
  } = useMessageHandlers();
  
  const navigate = useNavigate();
  const { suggestedPrompts } = useSuggestedPrompts();
  const { loadChatById, chatIdLoaded } = useChatMessages();

  const handleNewChat = useCallback(() => {
    console.log("handleNewChat called - beginning new chat creation process");
    
    try {
      // Reset the chat first which clears messages and generates a new ID
      const newId = resetChat();
      console.log("Chat reset completed, new ID generated:", newId);
      
      // Clear the input field
      setInput('');
      
      // Navigate to root to ensure we're in a clean state
      // Use push instead of navigating to ensure a full reload of the chat route
      console.log("Navigating to root path");
      navigate('/', { replace: true });
      
      console.log("New chat creation process completed successfully");
      return newId;
    } catch (error) {
      console.error("Error creating new chat:", error);
      return null;
    }
  }, [resetChat, setInput, navigate]);

  // Make sure this is always enabled - canCreateNewChat will always be true
  const canCreateNewChat = true;

  return {
    messages,
    input,
    setInput,
    isLoading,
    handleSendMessage,
    handleImageUpload,
    handleListingAnalysis,
    handleSuggestedPrompt,
    suggestedPrompts,
    hasAskedForVehicle,
    resetChat,
    handleNewChat,
    canCreateNewChat,
    loadChatById,
    chatId,
    chatIdLoaded
  };
};
