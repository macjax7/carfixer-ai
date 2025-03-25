
import { useState } from 'react';
import { useOpenAI } from '@/utils/openai/hook';
import { nanoid } from 'nanoid';
import { Message } from '@/components/chat/types';
import { useToast } from '@/hooks/use-toast';

export const useImageHandler = (addMessageToChat: (message: Message) => void) => {
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const { identifyPart } = useOpenAI();
  const { toast } = useToast();

  const handleImageUpload = async (imageFile: File, userPrompt: string = '') => {
    if (!imageFile) return;
    
    // Validate image before processing
    if (!imageFile.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file",
        variant: "destructive"
      });
      return;
    }
    
    // Check file size - limit to 5MB for optimal performance
    if (imageFile.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please use an image smaller than 5MB for better analysis",
        variant: "destructive"
      });
      return;
    }
    
    setIsProcessingImage(true);
    
    try {
      console.log("Processing image:", {
        name: imageFile.name,
        type: imageFile.type,
        size: `${(imageFile.size / 1024).toFixed(2)} KB`
      });
      
      // Create a local URL for the image
      const imageUrl = URL.createObjectURL(imageFile);
      
      // Create proper prompt if none provided
      const effectivePrompt = userPrompt.trim() || 'Can you identify this car part?';
      
      // Add the user message with image to the chat
      const userMessage: Message = {
        id: nanoid(),
        sender: 'user',
        text: effectivePrompt,
        timestamp: new Date(),
        image: imageUrl
      };
      
      addMessageToChat(userMessage);
      
      // Process the image with AI
      console.log("Calling identifyPart with image URL");
      const response = await identifyPart(imageUrl, effectivePrompt);
      console.log("Received response from identifyPart, length:", response?.length || 0);
      
      // Create the AI response message
      const aiMessage: Message = {
        id: nanoid(),
        sender: 'ai',
        text: response || 'I couldn\'t identify this part. Could you provide a clearer image?',
        timestamp: new Date()
      };
      
      addMessageToChat(aiMessage);
    } catch (error) {
      console.error('Error processing image:', error);
      
      // Provide a helpful error message based on the failure
      let errorMessage = 'Sorry, I encountered an error analyzing your image.';
      
      if (error.message?.includes('timeout')) {
        errorMessage = 'The image analysis took too long. Please try a smaller or clearer image.';
      } else if (error.message?.includes('too large')) {
        errorMessage = 'The image is too large. Please use a smaller image (under 5MB).';
      }
      
      // Add error message
      addMessageToChat({
        id: nanoid(),
        sender: 'ai',
        text: errorMessage,
        timestamp: new Date()
      });
      
      toast({
        title: "Image Analysis Failed",
        description: errorMessage,
        variant: "destructive"
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
