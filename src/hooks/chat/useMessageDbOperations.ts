
import { useCallback } from "react";
import { useChatDatabase } from "./useChatDatabase";
import { Message } from "@/components/chat/types";
import { useMessageErrorHandler } from "./useMessageErrorHandler";

export const useMessageDbOperations = () => {
  const { addToChatHistory } = useChatDatabase();
  const { handleDatabaseError } = useMessageErrorHandler();

  /**
   * Save user message to database
   */
  const saveUserMessage = useCallback(async (
    chatId: string, 
    messageData: Message, 
    userId: string
  ): Promise<string | null> => {
    try {
      console.log("Saving user message to database...", {
        chatId,
        messageId: messageData.id,
        userId
      });
      
      const messageId = await addToChatHistory(chatId, messageData, 'user');
      if (messageId) {
        console.log("User message added to database with ID:", messageId);
        return messageId;
      } else {
        console.warn("User message may not have been saved to database");
        return null;
      }
    } catch (error) {
      handleDatabaseError(error, "save your message to history");
      return null;
    }
  }, [addToChatHistory, handleDatabaseError]);

  /**
   * Save AI message to database
   */
  const saveAIMessage = useCallback(async (
    chatId: string, 
    messageData: Message, 
    userId: string
  ): Promise<string | null> => {
    try {
      console.log("Saving AI message to database...");
      const messageId = await addToChatHistory(chatId, messageData, 'assistant');
      if (messageId) {
        console.log("AI message added to database with ID:", messageId);
        return messageId;
      }
      return null;
    } catch (error) {
      handleDatabaseError(error, "save AI response to history");
      return null;
    }
  }, [addToChatHistory, handleDatabaseError]);

  return {
    saveUserMessage,
    saveAIMessage
  };
};
