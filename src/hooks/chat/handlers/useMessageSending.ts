
import { useCallback } from "react";
import { Message } from "@/components/chat/types";
import { useToast } from '@/hooks/use-toast';
import { isValidUUID } from "@/utils/uuid";
import { useChatMessaging } from "./useChatMessaging";

export const useMessageSending = (
  user: any | null, 
  chatId: string | null, 
  storeMessage: (chatId: string, messageId: string, content: string, role: 'user' | 'assistant', imageUrl?: string) => Promise<string | null>,
  updateChatTitle: (chatId: string, userId: string, title: string) => Promise<void>,
  addMessage: (message: Message) => void,
  markMessageProcessed: (id: string) => void,
  setInput: (input: string) => void
) => {
  const { toast } = useToast();
  const { processMessage } = useChatMessaging();
  
  // Send a message
  const sendMessage = useCallback(async (text: string, prevMessages: Message[], image?: string) => {
    if (!text.trim() && !image) return;
    if (!chatId) {
      toast({
        title: "Error",
        description: "Chat session not initialized",
        variant: "destructive"
      });
      return;
    }
    
    try {
      // Process the message and get both user and AI messages
      const { userMessage, aiMessage } = await processMessage(text, image, prevMessages.slice(-10));
      
      // Mark both messages as processed to avoid duplication via realtime updates
      markMessageProcessed(userMessage.id);
      markMessageProcessed(aiMessage.id);
      
      // Add user message to UI
      addMessage(userMessage);
      
      // For authenticated users with valid UUID chatId, save message to database
      if (user && isValidUUID(chatId)) {
        await storeMessage(chatId, userMessage.id, userMessage.text, 'user', userMessage.image);
      }
      
      // Add AI message to UI
      addMessage(aiMessage);
      
      // For authenticated users with valid UUID chatId, save AI message to database
      if (user && isValidUUID(chatId)) {
        await storeMessage(chatId, aiMessage.id, aiMessage.text, 'assistant');
        
        // Update the chat session title if this is the first message
        if (prevMessages.length <= 1 && user) {
          await updateChatTitle(chatId, user.id, text.substring(0, 50));
        }
      }
      
      // Clear input
      setInput('');
      
      return { userMessage, aiMessage };
    } catch (error) {
      console.error("Error in sendMessage:", error);
      return null;
    }
  }, [
    chatId, 
    user, 
    toast, 
    isValidUUID, 
    processMessage, 
    addMessage, 
    markMessageProcessed, 
    storeMessage, 
    updateChatTitle,
    setInput
  ]);

  return {
    sendMessage
  };
};
