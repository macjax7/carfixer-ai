
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { useOpenAI, ChatMessage } from '@/utils/openai';
import { Message } from './types';
import { useVehicles } from '@/hooks/use-vehicles';
import { nanoid } from 'nanoid';

export const useChat = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'ai',
      text: "Hello! I'm your CarFix AI assistant. How can I help with your vehicle today?",
      timestamp: new Date()
    }
  ]);
  
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messageHistory, setMessageHistory] = useState<string[]>([]);
  const [hasAskedForVehicle, setHasAskedForVehicle] = useState(false);
  const { toast } = useToast();
  const { chatWithAI, identifyPart, analyzeListing } = useOpenAI();
  const { selectedVehicle } = useVehicles();
  
  // Helper function to detect OBD-II codes in a message
  const containsDTCCode = (message: string): boolean => {
    // Pattern for OBD-II codes: P, B, C, or U followed by 4 digits
    const dtcPattern = /\b[PBCU][0-9]{4}\b/i;
    return dtcPattern.test(message);
  };
  
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim() || isLoading) return;
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: input,
      timestamp: new Date()
    };
    
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setMessageHistory(prev => [...prev, input]); // Add to message history
    setInput('');
    setIsLoading(true);
    
    try {
      // Prepare the messages array for the API
      const apiMessages: ChatMessage[] = messages
        .filter(msg => msg.id !== '1') // Filter out the welcome message
        .concat(userMessage)
        .map(msg => ({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.text
        }));
      
      // Check if the query contains a DTC code
      const containsCode = containsDTCCode(input);
      
      // Call the OpenAI API with message history for context
      const aiResponse = await chatWithAI(apiMessages, true, selectedVehicle, messageHistory);
      
      // Check if the response is requesting vehicle information
      if (typeof aiResponse === 'object' && aiResponse.requestVehicleInfo) {
        setHasAskedForVehicle(true);
      }
      
      const aiMessage: Message = {
        id: Date.now().toString(),
        sender: 'ai',
        text: typeof aiResponse === 'object' ? aiResponse.message : aiResponse,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
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
    const userMessage: Message = {
      id: nanoid(),
      sender: 'user',
      text: userPrompt,
      timestamp: new Date(),
      image: URL.createObjectURL(file)
    };
    
    setMessages(prevMessages => [...prevMessages, userMessage]);
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
      
      const aiMessage: Message = {
        id: nanoid(),
        sender: 'ai',
        text: analysis,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
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
      setMessages(prev => [...prev, {
        id: nanoid(),
        sender: 'ai',
        text: "I couldn't analyze that image. Please try again with a clearer picture of the car part.",
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleListingAnalysis = async (url: string) => {
    if (isLoading) return;
    
    // Create a message for the user indicating they've shared a listing URL
    const userMessage: Message = {
      id: nanoid(),
      sender: 'user',
      text: `Can you analyze this vehicle listing? ${url}`,
      timestamp: new Date()
    };
    
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInput('');
    setIsLoading(true);
    
    try {
      // Call the API to analyze the vehicle listing
      const listingData = await analyzeListing(url);
      
      // Create AI response with the vehicle listing analysis
      const aiMessage: Message = {
        id: nanoid(),
        sender: 'ai',
        text: "I've analyzed this vehicle listing for you. Here's what I found:",
        timestamp: new Date(),
        vehicleListingAnalysis: {
          url,
          ...listingData
        }
      };
      
      setMessages(prev => [...prev, aiMessage]);
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
      setMessages(prev => [...prev, {
        id: nanoid(),
        sender: 'ai',
        text: "I couldn't analyze that vehicle listing. The URL may be invalid or not from a supported platform. Try pasting a direct link to a vehicle listing from platforms like Craigslist, Facebook Marketplace, CarGurus, AutoTrader, etc.",
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestedPrompt = (prompt: string) => {
    setInput(prompt);
  };
  
  // Adding more car-related suggested prompts including OBD code examples and part identification
  const suggestedPrompts = [
    "What could cause a P0300 code?",
    "My check engine light is on with code P0420",
    "My engine is overheating",
    "How do I change brake pads?",
    "What does the check engine light mean?",
    "Can you help identify a car part from a photo?",
    "Analyze a vehicle listing for me"
  ];

  return {
    messages,
    input,
    setInput,
    isLoading,
    handleSendMessage,
    handleImageUpload,
    handleListingAnalysis,
    handleSuggestedPrompt,
    suggestedPrompts,
    hasAskedForVehicle
  };
};
