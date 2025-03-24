
import { useCallback } from 'react';
import { Message } from '@/components/chat/types';
import { ChatMessage } from '@/utils/openai/types';

export const useChatOperations = (
  messages: Message[],
  resetMessages: () => void,
  generateNewChatId: () => string,
  loadChatByIdHandler: (id: string, setChatId: (id: string | null) => void, setMessages: (messages: Message[]) => void) => Promise<any>,
  setChatId: (id: string | null) => void,
  setMessages: (messages: Message[]) => void
) => {
  // Reset chat state and generate new ID
  const resetChat = useCallback(() => {
    console.log("Resetting chat");
    
    // Clear messages and history
    resetMessages();
    
    // Generate new chat ID
    const newId = generateNewChatId();
    
    return newId;
  }, [resetMessages, generateNewChatId]);
  
  // Load existing chat by ID
  const loadChatById = useCallback(async (id: string) => {
    try {
      // Set chat ID first
      setChatId(id);
      
      // Clear existing messages - they will be loaded via real-time subscription
      resetMessages();
      
      return await loadChatByIdHandler(id, setChatId, setMessages);
    } catch (error) {
      console.error("Error loading chat by ID:", error);
    }
  }, [loadChatByIdHandler, setChatId, resetMessages, setMessages]);

  // Format messages for API
  const getMessagesForAPI = useCallback((userMessage: Message): ChatMessage[] => {
    return messages
      .concat(userMessage)
      .map(msg => ({
        role: msg.sender === 'user' ? 'user' as const : 'assistant' as const,
        content: msg.text
      }));
  }, [messages]);

  return {
    resetChat,
    loadChatById,
    getMessagesForAPI
  };
};
