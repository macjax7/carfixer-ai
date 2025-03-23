
import { FormEvent } from 'react';
import { useChatMessages } from './useChatMessages';
import { useMessageInput } from './useMessageInput';
import { useMessageSender } from './useMessageSender';
import { useChatHistory } from './useChatHistory';

export const useMessageHandlers = () => {
  const { messages, chatId, isLoading: messagesLoading } = useChatMessages();
  const { input, setInput, isLoading: inputLoading, hasAskedForVehicle } = useMessageInput();
  const { processAndSendMessage, isProcessing } = useMessageSender();
  const { saveCurrentChat, resetChat } = useChatHistory();

  const handleSendMessage = (e: FormEvent) => {
    e.preventDefault();
    if (input.trim() && !inputLoading && !isProcessing && !messagesLoading) {
      processAndSendMessage(input);
      setInput('');
    }
  };

  const handleImageUpload = (file: File) => {
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      processAndSendMessage(input, imageUrl);
      setInput('');
    }
  };

  const handleListingAnalysis = (url: string) => {
    if (url) {
      processAndSendMessage(`Can you analyze this vehicle listing? ${url}`);
      setInput('');
    }
  };

  const handleSuggestedPrompt = (prompt: string) => {
    setInput(prompt);
  };
  
  return {
    messages,
    input,
    setInput,
    isLoading: inputLoading || isProcessing || messagesLoading,
    handleSendMessage,
    handleImageUpload,
    handleListingAnalysis,
    handleSuggestedPrompt,
    hasAskedForVehicle,
    resetChat,
    saveCurrentChat,
    chatId
  };
};
