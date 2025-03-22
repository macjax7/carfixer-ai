
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
    hasAskedForVehicle
  } = useMessageHandlers();
  
  const { suggestedPrompts } = useSuggestedPrompts();
  
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
    hasAskedForVehicle
  };
};
