
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
    console.log("handleNewChat called");
    // Reset the chat first which clears messages and generates a new ID
    const newId = resetChat();
    
    // Clear the input field
    setInput('');
    
    // Navigate to root to ensure we're in a clean state
    navigate('/');
    
    console.log("New chat created with ID:", newId);
    return newId;
  }, [resetChat, setInput, navigate]);

  // Determine if a new chat can be created (not loading and has messages)
  const canCreateNewChat = !isLoading;

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
