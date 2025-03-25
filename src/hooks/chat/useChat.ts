
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
  const { loadChatById, chatIdLoaded, resetChat: resetChatMessages } = useChatMessages();

  const handleNewChat = useCallback(() => {
    console.log("handleNewChat called - beginning new chat creation process");
    
    try {
      // First, ensure we reset messages properly using useChatMessages resetChat
      resetChatMessages();
      
      // Then reset other chat state with messageHandlers resetChat
      const newId = resetChat();
      console.log("Chat reset completed, new ID generated:", newId);
      
      // Clear the input field
      setInput('');
      
      // Navigate to the new chat URL to ensure all components are reset
      if (newId) {
        console.log("Navigating to new chat path:", `/chat/${newId}`);
        navigate(`/chat/${newId}`, { replace: true });
      } else {
        console.log("Navigating to root path");
        navigate('/', { replace: true });
      }
      
      console.log("New chat creation process completed successfully");
      return newId;
    } catch (error) {
      console.error("Error creating new chat:", error);
      return null;
    }
  }, [resetChat, resetChatMessages, setInput, navigate]);

  // Always enable the new chat button
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
