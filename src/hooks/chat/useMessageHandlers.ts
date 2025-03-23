
import { FormEvent } from 'react';
import { useChatMessages } from './useChatMessages';
import { useMessageInput } from './useMessageInput';
import { useMessageSender } from './useMessageSender';
import { useImageHandler } from './useImageHandler';
import { useListingHandler } from './useListingHandler';
import { useChatHistory } from './useChatHistory';

export const useMessageHandlers = () => {
  const { messages, chatId } = useChatMessages();
  const { input, setInput, isLoading, hasAskedForVehicle } = useMessageInput();
  const { handleSendMessage } = useMessageSender();
  const { handleImageUpload } = useImageHandler();
  const { handleListingAnalysis } = useListingHandler();
  const { saveCurrentChat, resetChat } = useChatHistory();

  const handleSuggestedPrompt = (prompt: string) => {
    setInput(prompt);
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
    hasAskedForVehicle,
    resetChat,
    saveCurrentChat
  };
};
