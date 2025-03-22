
import { useState } from 'react';

export const useMessageInput = () => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasAskedForVehicle, setHasAskedForVehicle] = useState(false);

  return {
    input,
    setInput,
    isLoading,
    setIsLoading,
    hasAskedForVehicle,
    setHasAskedForVehicle
  };
};
