
import { useState } from 'react';
import { useOpenAI } from '@/utils/openai/hook';
import { nanoid } from 'nanoid';
import { Message } from '@/components/chat/types';

export const useListingHandler = (addMessageToChat: (message: Message) => void) => {
  const [isProcessingListing, setIsProcessingListing] = useState(false);
  const { analyzeListing } = useOpenAI();

  const handleListingAnalysis = async (url: string) => {
    if (!url) return;
    
    setIsProcessingListing(true);
    
    try {
      // Add the user message to the chat
      const userMessage: Message = {
        id: nanoid(),
        sender: 'user',
        text: `Can you analyze this vehicle listing? ${url}`,
        timestamp: new Date().toISOString()
      };
      
      addMessageToChat(userMessage);
      
      // Process the listing with AI
      const listing = await analyzeListing(url);
      
      // Create a message with the listing analysis
      const aiMessage: Message = {
        id: nanoid(),
        sender: 'assistant',
        text: listing?.summary || 'I couldn\'t analyze this listing. Please check the URL and try again.',
        timestamp: new Date().toISOString(),
        vehicleListingAnalysis: listing
      };
      
      addMessageToChat(aiMessage);
    } catch (error) {
      console.error('Error analyzing listing:', error);
      
      // Add error message
      addMessageToChat({
        id: nanoid(),
        sender: 'assistant',
        text: 'Sorry, I encountered an error analyzing this listing. Please check the URL and try again.',
        timestamp: new Date().toISOString()
      });
    } finally {
      setIsProcessingListing(false);
    }
  };
  
  return {
    handleListingAnalysis,
    isProcessingListing
  };
};
