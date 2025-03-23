
import { useToast } from '@/components/ui/use-toast';
import { useChatMessages } from './useChatMessages';
import { useMessageInput } from './useMessageInput';
import { useOpenAI } from '@/utils/openai';

export const useImageHandler = () => {
  const { toast } = useToast();
  const { identifyPart } = useOpenAI();
  const { addUserMessage, addAIMessage } = useChatMessages();
  const { input, setInput, isLoading, setIsLoading } = useMessageInput();

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

  return { handleImageUpload };
};
