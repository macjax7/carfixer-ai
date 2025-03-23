
import { useMessageHandlers } from './useMessageHandlers';
import { useSuggestedPrompts } from './useSuggestedPrompts';
import { useState, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';

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
  
  const { toast } = useToast();
  const { suggestedPrompts } = useSuggestedPrompts();
  
  // Check if we can create a new chat (only if the current chat has messages)
  const canCreateNewChat = messages.length > 0;
  
  // Handle starting a new chat
  const handleNewChat = useCallback(() => {
    if (canCreateNewChat) {
      // In a real app, this would save the current chat to history
      // For now, just reset the current chat
      resetChat();
      
      toast({
        title: "New Chat",
        description: "Started a new chat session",
      });
    }
  }, [canCreateNewChat, resetChat, toast]);
  
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
