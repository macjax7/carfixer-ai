import { FormEvent } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { useOpenAI, ChatMessage } from '@/utils/openai';
import { useVehicles } from '@/hooks/use-vehicles';
import { useChatMessages } from './useChatMessages';
import { useMessageInput } from './useMessageInput';
import { useCodeDetection } from './useCodeDetection';

export const useMessageHandlers = () => {
  const { toast } = useToast();
  const { chatWithAI, identifyPart, analyzeListing } = useOpenAI();
  const { selectedVehicle } = useVehicles();
  const { messages, messageHistory, addUserMessage, addAIMessage, getMessagesForAPI } = useChatMessages();
  const { input, setInput, isLoading, setIsLoading, hasAskedForVehicle, setHasAskedForVehicle } = useMessageInput();
  const { containsDTCCode } = useCodeDetection();
  
  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!input.trim() || isLoading) return;
    
    // Add user message
    const userMessage = addUserMessage(input);
    setInput('');
    setIsLoading(true);
    
    try {
      // Prepare the messages array for the API
      const apiMessages = getMessagesForAPI(userMessage);
      
      // Check if the query contains a DTC code
      const containsCode = containsDTCCode(input);
      
      // Call the OpenAI API with message history for context
      const aiResponse = await chatWithAI(apiMessages, true, selectedVehicle, messageHistory);
      
      // Check if the response is requesting vehicle information
      if (typeof aiResponse === 'object' && aiResponse.requestVehicleInfo) {
        setHasAskedForVehicle(true);
      }
      
      addAIMessage(typeof aiResponse === 'object' ? aiResponse.message : aiResponse);
    } catch (error) {
      console.error('Error getting AI response:', error);
      
      // Extract a more user-friendly error message if possible
      let errorMessage = "Sorry, I couldn't process your request. Please try again.";
      if (error instanceof Error) {
        // Try to extract a more specific error if available
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
  
  const handleImageUpload = async (file: File) => {
    if (isLoading) return;
    
    // Create a message for the user indicating they've uploaded an image
    const userPrompt = input.trim() || "Can you identify this car part?";
    const userMessage = addUserMessage(userPrompt, URL.createObjectURL(file));
    
    setInput('');
    setIsLoading(true);
    
    try {
      // Generate a response using the image analysis
      let prompt = userPrompt;
      if (!prompt.toLowerCase().includes("identify") && !prompt.toLowerCase().includes("what")) {
        prompt = `Identify this car part: ${prompt}`;
      }
      
      // Call the OpenAI API to analyze the image
      const imageUrl = URL.createObjectURL(file);
      const analysis = await identifyPart(imageUrl, prompt);
      
      addAIMessage(analysis);
    } catch (error) {
      console.error('Error analyzing image:', error);
      
      let errorMessage = "Sorry, I couldn't analyze the image. Please try again.";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
      
      // Add an error message from the AI
      addAIMessage("I couldn't analyze that image. Please try again with a clearer picture of the car part.");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleListingAnalysis = async (url: string) => {
    if (isLoading) return;
    
    // Create a message for the user indicating they've shared a listing URL
    const userMessage = addUserMessage(`Can you analyze this vehicle listing? ${url}`);
    
    setInput('');
    setIsLoading(true);
    
    try {
      // Call the API to analyze the vehicle listing
      const listingData = await analyzeListing(url);
      
      // Create AI response with the vehicle listing analysis
      addAIMessage("I've analyzed this vehicle listing for you. Here's what I found:", {
        vehicleListingAnalysis: {
          url,
          ...listingData
        }
      });
    } catch (error) {
      console.error('Error analyzing vehicle listing:', error);
      
      let errorMessage = "Sorry, I couldn't analyze that vehicle listing. Please try again with a different URL.";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
      
      // Add an error message from the AI
      addAIMessage("I couldn't analyze that vehicle listing. The URL may be invalid or not from a supported platform. Try pasting a direct link to a vehicle listing from platforms like Craigslist, Facebook Marketplace, CarGurus, AutoTrader, etc.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestedPrompt = (prompt: string) => {
    setInput(prompt);
  };
  
  return {
    messages,
    input,
    setInput,
    isLoading,
    handleSendMessage,
    handleImageUpload,
    handleListingAnalysis,
    handleSuggestedPrompt,
    hasAskedForVehicle
  };
};
