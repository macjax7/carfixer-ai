
import { useState, useCallback, useEffect } from 'react';
import { useMessageInput } from './useMessageInput';
import { useMessageSender } from './useMessageSender';
import { useMessageHandlers } from './useMessageHandlers';
import { useSuggestedPrompts } from './useSuggestedPrompts';
import { useImageHandler } from './useImageHandler';
import { useListingHandler } from './useListingHandler';
import { useChatMessages } from './useChatMessages';
import { nanoid } from 'nanoid';
import { ChatHistoryItem } from '@/hooks/chat/sidebar/types';

export const useChat = () => {
  const { 
    messages, 
    isLoading: messagesLoading,
    chatId,
    setChatId,
    resetChat: resetChatMessages,
    addUserMessage,
    addAIMessage,
    getMessagesForAPI
  } = useChatMessages();

  const [chatIdLoaded, setChatIdLoaded] = useState<string | null>(null);
  const [hasAskedForVehicle, setHasAskedForVehicle] = useState(false);
  const [isCreatingNewChat, setIsCreatingNewChat] = useState(false);
  
  // Input handling
  const { input, setInput, canSendMessage, resetInput } = useMessageInput();
  
  // Get suggestion prompts
  const { suggestedPrompts } = useSuggestedPrompts();

  // Message sender hook
  const { processAndSendMessage, isProcessing } = useMessageSender();

  // Specialized handlers
  const { handleImageUpload } = useImageHandler(processAndSendMessage);
  const { handleListingAnalysis } = useListingHandler(processAndSendMessage);
  
  // Determine if we can create a new chat based on current state
  const canCreateNewChat = !isCreatingNewChat && !messagesLoading && messages.length === 0;
  
  // Function to load a specific chat by ID
  const loadChatById = useCallback(async (id: string) => {
    if (id === chatIdLoaded) return;
    
    setChatId(id);
    setChatIdLoaded(id);
  }, [setChatId, chatIdLoaded]);
  
  // Create a new chat/conversation
  const handleNewChat = useCallback(() => {
    setIsCreatingNewChat(true);
    resetChatMessages();
    resetInput();
    setHasAskedForVehicle(false);
    setChatIdLoaded(null);
    setIsCreatingNewChat(false);
  }, [resetChatMessages, resetInput]);
  
  // Handle sending a message
  const handleSendMessage = useCallback(async () => {
    if (!canSendMessage || !input.trim()) return;
    
    await processAndSendMessage(input);
    resetInput();
  }, [canSendMessage, input, processAndSendMessage, resetInput]);
  
  // Handle clicking on a suggested prompt
  const handleSuggestedPrompt = useCallback(async (promptText: string) => {
    setInput(promptText);
    await processAndSendMessage(promptText);
    resetInput();
  }, [processAndSendMessage, resetInput, setInput]);
  
  // Combine loading states
  const isLoading = messagesLoading || isProcessing;
  
  return {
    messages,
    input,
    setInput,
    handleSendMessage,
    handleImageUpload,
    handleListingAnalysis,
    handleNewChat,
    handleSuggestedPrompt,
    isLoading,
    suggestedPrompts,
    hasAskedForVehicle,
    canCreateNewChat,
    chatId,
    loadChatById,
    chatIdLoaded
  };
};
