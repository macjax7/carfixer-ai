
import { useState, useCallback, useEffect } from "react";
import { Message } from "@/components/chat/types";
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useChatId } from "./handlers/useChatId";
import { useChatStorage } from "./handlers/useChatStorage";
import { useChatMessaging } from "./handlers/useChatMessaging";
import { useRealtimeMessages } from "./handlers/useRealtimeMessages";
import { useMessageLoading } from "./handlers/useMessageLoading";
import { useChatInitialization } from "./handlers/useChatInitialization";
import { useChatReset } from "./handlers/useChatReset";
import { useChatLoader } from "./handlers/useChatLoader";
import { useMessageSending } from "./handlers/useMessageSending";
import { useRealtimeMessageHandler } from "./useRealtimeMessageHandler";
import { useInputHandler } from "./useInputHandler";

export const useDirectChatHandler = () => {
  // User and authentication
  const { user } = useAuth();
  const { toast } = useToast();

  // Chat ID management
  const [chatId, setChatId] = useState<string | null>(null);
  const { isValidUUID } = useChatId();
  
  // Message state management with deduplication
  const {
    messages,
    setMessages,
    addMessage,
    markMessageProcessed
  } = useRealtimeMessageHandler();
  
  // Chat storage and messaging
  const { createChatSession, updateChatTitle, storeMessage } = useChatStorage();
  const { isProcessing } = useChatMessaging();
  
  // Initialize chat
  const { initializeChat } = useChatInitialization(user, setChatId);
  
  // Reset chat
  const { resetChat: resetChatHandler } = useChatReset(user, setChatId);
  
  // Load chat
  const { loadChatById: loadChatByIdHandler } = useChatLoader();
  
  // Set up realtime messaging
  useRealtimeMessages(chatId, addMessage);
  
  // Send messages
  const { sendMessage: sendMessageHandler } = useMessageSending(
    user,
    chatId,
    storeMessage,
    updateChatTitle,
    addMessage,
    markMessageProcessed,
    (text: string) => setInput(text)
  );
  
  // Input handling
  const {
    input,
    setInput,
    handleSendMessage,
    handleTextInput,
    handleImageUpload,
    handleListingAnalysis,
    handleSuggestedPrompt
  } = useInputHandler(
    (text, messages, image) => sendMessageHandler(text, messages, image),
    messages,
    isProcessing
  );
  
  // Initialize chat on mount
  useEffect(() => {
    if (!chatId) {
      initializeChat();
    }
  }, [chatId, initializeChat]);
  
  // Wrapped handlers that maintain the same API
  const resetChat = useCallback(async () => {
    // Clear messages
    setMessages([]);
    return resetChatHandler();
  }, [resetChatHandler, setMessages]);
  
  const loadChatById = useCallback(async (id: string) => {
    // Reset the current state
    setMessages([]);
    return loadChatByIdHandler(id, setChatId, setMessages);
  }, [loadChatByIdHandler, setChatId, setMessages]);
  
  const sendMessage = useCallback(async (text: string, image?: string) => {
    return sendMessageHandler(text, messages, image);
  }, [sendMessageHandler, messages]);

  return {
    messages,
    input,
    setInput,
    isProcessing,
    sendMessage,
    chatId,
    resetChat,
    loadChatById,
    handleSendMessage,
    handleTextInput,
    handleImageUpload, 
    handleListingAnalysis,
    handleSuggestedPrompt
  };
};
