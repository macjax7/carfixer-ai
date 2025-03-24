
import { useCallback } from "react";
import { nanoid } from "nanoid";
import { Message } from "@/components/chat/types";

export const useUserMessageProcessor = () => {
  /**
   * Process and format a user message
   */
  const processUserMessage = useCallback((text: string, image?: string): Message => {
    return {
      id: nanoid(),
      sender: 'user' as const,
      text,
      timestamp: new Date(),
      image
    };
  }, []);

  return { processUserMessage };
};
