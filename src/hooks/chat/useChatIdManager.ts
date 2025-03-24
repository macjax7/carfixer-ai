
import { useCallback } from "react";
import { v4 as uuidv4 } from 'uuid';
import { isValidUUID } from "@/utils/uuid";
import { useChatSession } from "./useChatSession";

export const useChatIdManager = (chatId: string | null, setChatId: (id: string) => void) => {
  const { ensureChatSession, updateSessionTitle } = useChatSession(chatId, setChatId);

  /**
   * Ensure we have a valid chat ID
   */
  const ensureChatId = useCallback((): string => {
    let currentChatId = chatId;
    
    if (!currentChatId) {
      currentChatId = uuidv4();
      setChatId(currentChatId);
      console.log("Generated new chat ID:", currentChatId);
    } else if (!isValidUUID(currentChatId)) {
      console.warn("Current chatId is not a valid UUID:", currentChatId);
      currentChatId = uuidv4();
      setChatId(currentChatId);
      console.log("Generated new UUID-formatted chat ID:", currentChatId);
    }
    
    return currentChatId;
  }, [chatId, setChatId]);

  /**
   * Ensure chat session exists for an authenticated user
   */
  const ensureUserChatSession = useCallback(async (message: string, userId: string): Promise<string> => {
    console.log("User is authenticated, ensuring chat session exists", { userId });
    const ensuredChatId = await ensureChatSession(message, userId);
    
    if (ensuredChatId) {
      console.log("Ensured chat session exists:", ensuredChatId);
      
      // Update title if this is the first message in an existing chat
      await updateSessionTitle(ensuredChatId, message, userId);
      return ensuredChatId;
    } else {
      console.error("Failed to ensure chat session, using fallback ID");
      return ensureChatId();
    }
  }, [ensureChatSession, updateSessionTitle, ensureChatId]);

  return {
    ensureChatId,
    ensureUserChatSession
  };
};
