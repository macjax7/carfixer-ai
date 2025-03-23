
import { useState, useCallback } from 'react';

export const useMessageInput = () => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasAskedForVehicle, setHasAskedForVehicle] = useState(false);

  // Add the missing functions that useChat expects
  const canSendMessage = !isLoading && input.trim().length > 0;
  
  const resetInput = useCallback(() => {
    setInput('');
  }, []);

  return {
    input,
    setInput,
    isLoading,
    setIsLoading,
    hasAskedForVehicle,
    setHasAskedForVehicle,
    canSendMessage,
    resetInput
  };
};
