
import { useCallback } from "react";
import { v4 as uuidv4 } from 'uuid';

export const useChatId = () => {
  const generateChatId = useCallback((useUUID: boolean = true) => {
    if (useUUID) {
      return uuidv4();
    } else {
      // For guests, we can use a simple random ID
      return `guest-${Math.random().toString(36).substring(2, 12)}`;
    }
  }, []);

  const isValidUUID = useCallback((id: string) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(id);
  }, []);

  return {
    generateChatId,
    isValidUUID
  };
};
