
import { useCallback } from "react";
import { v4 as uuidv4 } from 'uuid';
import { nanoid } from "nanoid";

export const useChatId = () => {
  // Generate a chat ID based on authentication state
  const generateChatId = useCallback((isAuthenticated: boolean) => {
    // For authenticated users, use UUID format for database compatibility
    if (isAuthenticated) {
      const newId = uuidv4();
      console.log("Generated new UUID chat ID:", newId);
      return newId;
    } 
    
    // For guests, use nanoid for simplicity
    const guestId = nanoid();
    console.log("Generated new guest chat ID:", guestId);
    return guestId;
  }, []);

  // Check if a chat ID is in valid UUID format (for DB operations)
  const isValidUUID = useCallback((id: string) => {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
  }, []);

  return {
    generateChatId,
    isValidUUID
  };
};
