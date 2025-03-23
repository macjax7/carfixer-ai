
import { useToast } from '@/components/ui/use-toast';
import { useChatMessages } from './useChatMessages';
import { useMessageInput } from './useMessageInput';
import { useOpenAI } from '@/utils/openai';

export const useListingHandler = () => {
  const { toast } = useToast();
  const { analyzeListing } = useOpenAI();
  const { addUserMessage, addAIMessage } = useChatMessages();
  const { setInput, isLoading, setIsLoading } = useMessageInput();

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

  return { handleListingAnalysis };
};
