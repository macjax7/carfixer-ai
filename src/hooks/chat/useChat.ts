
import { useMessageHandlers } from './useMessageHandlers';
import { useSuggestedPrompts } from './useSuggestedPrompts';

export const useChat = () => {
  const {
    messages,
    input,
    setInput,
    isLoading,
    handleSendMessage,
    handleImageUpload,
    handleListingAnalysis,
    handleSuggestedPrompt,
    hasAskedForVehicle,
    resetChat
  } = useMessageHandlers();
  
  const { suggestedPrompts } = useSuggestedPrompts();
  
  // Check if we can create a new chat (only if the current chat has messages)
  const canCreateNewChat = messages.length > 0;
  
  // Handle starting a new chat
  const handleNewChat = () => {
    if (canCreateNewChat) {
      // TODO: In a real app, this would save the current chat to history
      
      // Reset the current chat
      resetChat();
    }
  };
  
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
    handleNewChat,
    canCreateNewChat
  };
};
