
import { useCallback } from 'react';
import { useMessageHandlers } from './useMessageHandlers';
import { useSuggestedPrompts } from './useSuggestedPrompts';
import { useChatMessages } from './useChatMessages';

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

  const { suggestedPrompts } = useSuggestedPrompts();
  const { loadChatById, chatIdLoaded } = useChatMessages();

  const handleNewChat = useCallback(() => {
    const newId = resetChat();
    setInput('');
    return newId;
  }, [resetChat, setInput]);

  // Determine if a new chat can be created (not loading and has messages)
  const canCreateNewChat = !isLoading && messages.length > 0;

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
