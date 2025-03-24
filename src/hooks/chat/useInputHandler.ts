
import { useState, useCallback, FormEvent } from "react";

export const useInputHandler = (
  sendMessage: (text: string, messages: any[], image?: string) => Promise<any>, 
  messages: any[],
  isProcessing: boolean
) => {
  const [input, setInput] = useState('');
  
  const handleSendMessage = useCallback((e: FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isProcessing) {
      sendMessage(input, messages);
    }
  }, [input, isProcessing, sendMessage, messages]);
  
  const handleTextInput = useCallback((text: string) => {
    if (text.trim() && !isProcessing) {
      sendMessage(text, messages);
    }
  }, [isProcessing, sendMessage, messages]);
  
  const handleImageUpload = useCallback((file: File) => {
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      
      // Create a prompt based on the current input or use a default
      const prompt = input.trim() 
        ? input 
        : "Can you identify this car part or issue?";
        
      sendMessage(prompt, messages, imageUrl);
    }
  }, [input, sendMessage, messages]);
  
  const handleListingAnalysis = useCallback((url: string) => {
    if (url && !isProcessing) {
      sendMessage(`Can you analyze this vehicle listing? ${url}`, messages);
    }
  }, [isProcessing, sendMessage, messages]);
  
  const handleSuggestedPrompt = useCallback((prompt: string) => {
    setInput(prompt);
  }, []);
  
  return {
    input,
    setInput,
    handleSendMessage,
    handleTextInput,
    handleImageUpload,
    handleListingAnalysis,
    handleSuggestedPrompt
  };
};
