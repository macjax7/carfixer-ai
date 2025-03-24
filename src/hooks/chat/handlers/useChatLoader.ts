
import { useCallback } from "react";
import { useMessageLoading } from "./useMessageLoading";
import { Message } from "@/components/chat/types";

export const useChatLoader = () => {
  const { loadMessages } = useMessageLoading();
  
  // Load chat by ID
  const loadChatById = useCallback(async (
    id: string, 
    setChatId: (id: string | null) => void, 
    setMessages: (messages: Message[]) => void
  ) => {
    if (!id) return [];
    
    try {
      console.log("Loading chat:", id);
      
      // Set the chat ID
      setChatId(id);
      
      // Load messages for this chat
      const loadedMessages = await loadMessages(id);
      setMessages(loadedMessages);
      
      return loadedMessages;
    } catch (error) {
      console.error("Error loading chat:", error);
      return [];
    }
  }, [loadMessages]);

  return {
    loadChatById
  };
};
