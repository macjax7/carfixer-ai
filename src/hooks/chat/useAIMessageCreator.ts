
import { useCallback } from "react";
import { nanoid } from "nanoid";
import { Message } from "@/components/chat/types";

export const useAIMessageCreator = () => {
  /**
   * Create a formatted AI message
   */
  const createAIMessage = useCallback((
    text: string, 
    extraData: Record<string, any> = {}
  ): Message => {
    return {
      id: nanoid(),
      sender: 'ai' as const,
      text,
      timestamp: new Date(),
      ...extraData
    };
  }, []);

  return { createAIMessage };
};
