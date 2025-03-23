
import { useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { useMessageHandlers } from './useMessageHandlers';
import { useSuggestedPrompts } from './useSuggestedPrompts';

export const useChat = () => {
  const { toast } = useToast();
  const { suggestedPrompts } = useSuggestedPrompts();
  
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
    resetChat,
    saveCurrentChat
  } = useMessageHandlers();
  
  // Check if we can create a new chat (only if the current chat has messages)
  const canCreateNewChat = messages.length > 0;
  
  // Handle starting a new chat
  const handleNewChat = useCallback(() => {
    if (canCreateNewChat) {
      // Save the current chat to history
      saveCurrentChat();
      
      // Reset the current chat
      resetChat();
      
      toast({
        title: "New Chat",
        description: "Started a new chat session",
      });
    }
  }, [canCreateNewChat, resetChat, saveCurrentChat, toast]);
  
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
