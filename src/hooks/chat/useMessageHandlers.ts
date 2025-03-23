import { FormEvent } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { useOpenAI, ChatMessage } from '@/utils/openai';
import { useVehicles } from '@/hooks/use-vehicles';
import { useChatMessages } from './useChatMessages';
import { useMessageInput } from './useMessageInput';
import { useCodeDetection } from './useCodeDetection';
import { useCallback } from 'react';
import { ChatHistoryItem } from '@/components/chat/sidebar/useSidebarState';

export const useMessageHandlers = () => {
  const { toast } = useToast();
  const { chatWithAI, identifyPart, analyzeListing } = useOpenAI();
  const { selectedVehicle } = useVehicles();
  const { messages, messageHistory, chatId, addUserMessage, addAIMessage, getMessagesForAPI, resetChat } = useChatMessages();
  const { input, setInput, isLoading, setIsLoading, hasAskedForVehicle, setHasAskedForVehicle } = useMessageInput();
  const { containsDTCCode } = useCodeDetection();
  
  const saveCurrentChat = useCallback(() => {
    if (messages.length === 0) return;
    
    const firstUserMessage = messages.find(m => m.sender === 'user');
    if (!firstUserMessage) return;
    
    const title = firstUserMessage.text.length > 30 
      ? firstUserMessage.text.substring(0, 30) + '...' 
      : firstUserMessage.text;
    
    const chatToSave: Omit<ChatHistoryItem, 'id'> = {
      title,
      timestamp: 'Just now',
      path: `#/chat/${chatId}`
    };
    
    console.log('Saving chat to history:', chatToSave);
  }, [messages, chatId]);
  
  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!input.trim() || isLoading) return;
    
    const userMessage = addUserMessage(input);
    setInput('');
    setIsLoading(true);
    
    try {
      const apiMessages = getMessagesForAPI(userMessage);
      const containsCode = containsDTCCode(input);
      
      const aiResponse = await chatWithAI(apiMessages, true, selectedVehicle, messageHistory);
      
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
  
  const handleImageUpload = async (file: File) => {
    if (isLoading) return;
    
    const userPrompt = input.trim() || "Can you identify this car part?";
    const userMessage = addUserMessage(userPrompt, URL.createObjectURL(file));
    
    setInput('');
    setIsLoading(true);
    
    try {
      let prompt = userPrompt;
      if (!prompt.toLowerCase().includes("identify") && !prompt.toLowerCase().includes("what")) {
        prompt = `Identify this car part: ${prompt}`;
      }
      
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
      
      addAIMessage("I couldn't analyze that image. Please try again with a clearer picture of the car part.");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleListingAnalysis = async (url: string) => {
    if (isLoading) return;
    
    const userMessage = addUserMessage(`Can you analyze this vehicle listing? ${url}`);
    
    setInput('');
    setIsLoading(true);
    
    try {
      const listingData = await analyzeListing(url);
      
      if (listingData.extractionFailed || listingData.unreliableExtraction) {
        console.warn('Vehicle data extraction failed or was unreliable:', listingData);
        
        addAIMessage(`I couldn't reliably extract information from this vehicle listing. ${listingData.errorMessage || 'The URL may be invalid, require authentication, or the listing format is not supported.'}
        
If you'd like me to analyze a vehicle, you can:
1. Try a different listing URL from a supported platform (CarGurus, Autotrader, Facebook Marketplace, Craigslist, etc.)
2. Or tell me about the vehicle directly by providing the year, make, model, mileage, and price.`);
        
        return;
      }
      
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
      
      addAIMessage(`I couldn't analyze that vehicle listing. ${error instanceof Error ? error.message : 'The URL may be invalid or not from a supported platform.'}
      
Try pasting a direct link to a vehicle listing from platforms like Craigslist, Facebook Marketplace, CarGurus, AutoTrader, etc. Make sure the listing is publicly accessible and doesn't require login credentials to view.`);
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
    hasAskedForVehicle,
    resetChat,
    saveCurrentChat
  };
};
