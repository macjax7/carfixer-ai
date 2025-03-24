
import { v4 as uuidv4 } from 'uuid';
import { isValidUUID } from '@/utils/uuid';

export const useMessageId = () => {
  /**
   * Generates a valid UUID for message IDs
   */
  const generateMessageId = () => {
    return uuidv4();
  };

  /**
   * Validates a message ID to ensure it's a proper UUID
   */
  const validateMessageId = (id: string): boolean => {
    return isValidUUID(id);
  };

  /**
   * Ensures a message ID is valid, or generates a new one if not
   */
  const ensureValidMessageId = (currentId?: string): string => {
    if (currentId && validateMessageId(currentId)) {
      return currentId;
    }
    return generateMessageId();
  };

  return {
    generateMessageId,
    validateMessageId,
    ensureValidMessageId
  };
};
