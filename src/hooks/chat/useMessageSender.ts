
import { FormEvent } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { useChatMessages } from './useChatMessages';
import { useMessageInput } from './useMessageInput';
import { useCodeDetection } from './useCodeDetection';
import { useOpenAI } from '@/utils/openai';
import { useVehicles } from '@/hooks/use-vehicles';
import { supabase } from '@/integrations/supabase/client';

export const useMessageSender = () => {
  const { toast } = useToast();
  const { chatWithAI } = useOpenAI();
  const { selectedVehicle } = useVehicles();
  const { addUserMessage, addAIMessage, getMessagesForAPI, messageHistory } = useChatMessages();
  const { input, setInput, isLoading, setIsLoading, setHasAskedForVehicle } = useMessageInput();
  const { containsDTCCode } = useCodeDetection();

  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    
    console.log("handleSendMessage called with input:", input);
    if (!input.trim() || isLoading) {
      console.log("Input is empty or loading is in progress, returning");
      return;
    }
    
    const userMessage = addUserMessage(input);
    console.log("User message added:", userMessage);
    setInput('');
    setIsLoading(true);
    
    try {
      console.log("Preparing to send message to AI:", input);
      
      // Verify Supabase connection without querying a specific table
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          console.error("Supabase connection issue:", error);
          throw new Error(`Supabase connection issue: ${error.message}`);
        }
        console.log("Supabase connection verified");
      } catch (connectionError) {
        console.error("Error checking Supabase connection:", connectionError);
        // Continue anyway as this is just a connection check
      }
      
      const apiMessages = getMessagesForAPI(userMessage);
      const containsCode = containsDTCCode(input);
      
      console.log("Calling OpenAI API with messages:", apiMessages);
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
        errorMessage = error.message;
        console.error('Detailed error information:', error);
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
