
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { useOpenAI, ChatMessage } from '@/utils/openai';
import { Message } from './types';

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
  const { toast } = useToast();
  const { chatWithAI } = useOpenAI();
  
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
      
      // Call the OpenAI API
      const aiResponse = await chatWithAI(apiMessages);
      
      const aiMessage: Message = {
        id: Date.now().toString(),
        sender: 'ai',
        text: aiResponse,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      toast({
        title: "Error",
        description: "Sorry, I couldn't process your request. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleImageUpload = () => {
    // In a real app, this would open a file picker and process the image
    console.log('Image upload clicked');
  };

  const handleSuggestedPrompt = (prompt: string) => {
    setInput(prompt);
  };
  
  const suggestedPrompts = [
    "What could cause a P0300 code?",
    "My engine is overheating",
    "How do I change brake pads?",
    "What does the check engine light mean?"
  ];

  return {
    messages,
    input,
    setInput,
    isLoading,
    handleSendMessage,
    handleImageUpload,
    handleSuggestedPrompt,
    suggestedPrompts
  };
};
