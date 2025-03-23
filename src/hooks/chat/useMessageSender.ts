
import { FormEvent } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { useChatMessages } from './useChatMessages';
import { useMessageInput } from './useMessageInput';
import { useCodeDetection } from './useCodeDetection';
import { useOpenAI } from '@/utils/openai';
import { useVehicles } from '@/hooks/use-vehicles';

export const useMessageSender = () => {
  const { toast } = useToast();
  const { chatWithAI } = useOpenAI();
  const { selectedVehicle } = useVehicles();
  const { addUserMessage, addAIMessage, getMessagesForAPI, messageHistory } = useChatMessages();
  const { input, setInput, isLoading, setIsLoading, setHasAskedForVehicle } = useMessageInput();
  const { containsDTCCode } = useCodeDetection();

  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!input.trim() || isLoading) return;
    
    const userMessage = addUserMessage(input);
    setInput('');
    setIsLoading(true);
    
    try {
      console.log("Sending message to AI:", input);
      const apiMessages = getMessagesForAPI(userMessage);
      const containsCode = containsDTCCode(input);
      
      const aiResponse = await chatWithAI(apiMessages, true, selectedVehicle, messageHistory);
      console.log("Received AI response:", aiResponse);
      
      if (typeof aiResponse === 'object' && aiResponse.requestVehicleInfo) {
        setHasAskedForVehicle(true);
      }
      
      addAIMessage(typeof aiResponse === 'object' ? aiResponse.message : aiResponse);
    } catch (error) {
      console.error('Error getting AI response:', error);
      
      let errorMessage = "Sorry, I couldn't process your request. Please try again.";
      if (error instanceof Error) {
        if (error.message.includes('OpenAI API error')) {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return { handleSendMessage };
};
