
import { useState } from 'react';
import { useOpenAI } from '@/utils/openai/hook';
import { nanoid } from 'nanoid';
import { Message } from './types';

export const useImageHandler = (addMessageToChat: (message: Message) => void) => {
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const { identifyPart } = useOpenAI();

  const handleImageUpload = async (imageFile: File, userPrompt: string = '') => {
    if (!imageFile) return;
    
    setIsProcessingImage(true);
    
    try {
      // Create a local URL for the image
      const imageUrl = URL.createObjectURL(imageFile);
      
      // Add the user message with image to the chat
      const userMessage: Message = {
        id: nanoid(),
        sender: 'user',
        text: userPrompt || 'Can you identify this part?',
        timestamp: new Date().toISOString(),
        image: imageUrl
      };
      
      addMessageToChat(userMessage);
      
      // Process the image with AI
      const response = await identifyPart(imageUrl);
      
      // Create the AI response message
      const aiMessage: Message = {
        id: nanoid(),
        sender: 'assistant',
        text: response || 'I couldn\'t identify this part. Could you provide a clearer image?',
        timestamp: new Date().toISOString()
      };
      
      addMessageToChat(aiMessage);
    } catch (error) {
      console.error('Error processing image:', error);
      
      // Add error message
      addMessageToChat({
        id: nanoid(),
        sender: 'assistant',
        text: 'Sorry, I encountered an error analyzing your image. Please try again.',
        timestamp: new Date().toISOString()
      });
    } finally {
      setIsProcessingImage(false);
    }
  };
  
  return {
    handleImageUpload,
    isProcessingImage
  };
};
