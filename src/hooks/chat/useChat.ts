
import { useState, useCallback, useEffect } from 'react';
import { useMessageInput } from './useMessageInput';
import { useSuggestedPrompts } from './useSuggestedPrompts';
import { useImageHandler } from './useImageHandler';
import { useListingHandler } from './useListingHandler';
import { useChatMessages } from './useChatMessages';
import { useMessageSender } from './useMessageSender';
import { nanoid } from 'nanoid';
import { Message } from '@/components/chat/types';

export const useChat = () => {
  const { 
    messages, 
    isLoading: messagesLoading,
    chatId,
    setChatId,
    resetChat: resetChatMessages,
    addUserMessage,
    addAIMessage,
    loadChatById,
    chatIdLoaded
  } = useChatMessages();

  const [isCreatingNewChat, setIsCreatingNewChat] = useState(false);
  const [hasAskedForVehicle, setHasAskedForVehicle] = useState(false);
  
  // Input handling with the fixed hook that includes canSendMessage and resetInput
  const { input, setInput, canSendMessage, resetInput, isLoading: inputLoading } = useMessageInput();
  
  // Get suggestion prompts
  const { suggestedPrompts } = useSuggestedPrompts();
  
  // Get message sender
  const { processAndSendMessage, isProcessing } = useMessageSender();

  // Create adapter functions for the specialized handlers to match the expected signature
  const handleImageUploadAdapter = useCallback((file: File, prompt?: string) => {
    const messageText = prompt || 'Can you identify this part?';
    return handleImageUpload(file, messageText);
  }, []);
  
  const handleListingAnalysisAdapter = useCallback((url: string) => {
    return handleListingAnalysis(url);
  }, []);

  // Specialized handlers - fixing the signature mismatch
  const { handleImageUpload, isProcessingImage } = useImageHandler((message: Message) => {
    // Add the message directly to the chat
    addUserMessage(message);
    // Process the message for AI response
    return processAndSendMessage(message.text, message.image);
  });
  
  const { handleListingAnalysis, isProcessingListing } = useListingHandler((message: Message) => {
    // Add the message directly to the chat
    addUserMessage(message);
    // Process the message for AI response
    return processAndSendMessage(message.text, message.image);
  });
  
  // Determine if we can create a new chat based on current state
  const canCreateNewChat = !isCreatingNewChat && !messagesLoading && messages.length === 0;
  
  // Create a new chat/conversation
  const handleNewChat = useCallback(() => {
    setIsCreatingNewChat(true);
    resetChatMessages();
    resetInput();
    setHasAskedForVehicle(false);
    setIsCreatingNewChat(false);
  }, [resetChatMessages, resetInput]);
  
  // Handle sending a message
  const handleSendMessage = useCallback(async (e) => {
    if (e && e.preventDefault) e.preventDefault(); // Ensure form doesn't refresh page
    
    if (!canSendMessage || !input.trim()) return;
    
    // Process and send the message
    await processAndSendMessage(input);
    resetInput();
  }, [canSendMessage, input, processAndSendMessage, resetInput]);
  
  // Handle clicking on a suggested prompt
  const handleSuggestedPrompt = useCallback(async (promptText: string) => {
    setInput(promptText);
    // Create a synthetic event to pass to handleSendMessage
    await processAndSendMessage(promptText);
    resetInput();
  }, [processAndSendMessage, resetInput, setInput]);
  
  // Combine loading states - updated property names here
  const isLoading = messagesLoading || inputLoading || isProcessingImage || isProcessingListing || isProcessing;
  
  // Check AI responses for vehicle request patterns
  useEffect(() => {
    // Check the last AI message for vehicle request
    const lastAiMessage = [...messages].reverse().find(msg => msg.sender === 'ai');
    if (lastAiMessage) {
      const message = lastAiMessage.text.toLowerCase();
      if (
        (message.includes('which vehicle') || 
         message.includes('what vehicle') || 
         message.includes('what car') ||
         message.includes('which car') ||
         message.includes('make and model') ||
         message.includes('year, make') ||
         message.includes('vehicle you')) && 
        (message.includes('working on') || 
         message.includes('asking about') ||
         message.includes('referring to'))
      ) {
        setHasAskedForVehicle(true);
      }
    }
  }, [messages]);
  
  return {
    messages,
    input,
    setInput,
    handleSendMessage,
    handleImageUpload: handleImageUploadAdapter,
    handleListingAnalysis: handleListingAnalysisAdapter,
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
