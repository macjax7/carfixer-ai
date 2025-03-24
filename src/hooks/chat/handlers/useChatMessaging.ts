
import { useState, useCallback } from "react";
import { v4 as uuidv4 } from 'uuid';
import { Message } from "@/components/chat/types";
import { useToast } from '@/hooks/use-toast';
import { useMessageProcessing } from "./useMessageProcessing";

export const useChatMessaging = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const { processAIResponse } = useMessageProcessing();

  // Create a user message object
  const createUserMessage = useCallback((text: string, image?: string): Message => {
    return {
      id: uuidv4(),
      sender: 'user',
      text,
      timestamp: new Date(),
      image
    };
  }, []);

  // Create an AI message object
  const createAIMessage = useCallback((text: string, extra: Record<string, any> = {}): Message => {
    return {
      id: uuidv4(),
      sender: 'ai',
      text,
      timestamp: new Date(),
      ...extra
    };
  }, []);

  // Process user message and get AI response
  const processMessage = useCallback(async (
    text: string, 
    image?: string,
    contextMessages: Message[] = []
  ) => {
    setIsProcessing(true);
    
    try {
      const userMessage = createUserMessage(text, image);
      
      const aiResponse = await processAIResponse(text, image, contextMessages);
      const aiMessage = createAIMessage(aiResponse.text, aiResponse.extra);
      
      return { userMessage, aiMessage };
    } catch (error) {
      console.error("Error processing message:", error);
      
      toast({
        title: "Error",
        description: "Failed to get AI response",
        variant: "destructive"
      });
      
      const errorMessage = createAIMessage(
        "I'm sorry, I encountered an error processing your message. Please try again."
      );
      
      return { 
        userMessage: createUserMessage(text, image),
        aiMessage: errorMessage 
      };
    } finally {
      setIsProcessing(false);
    }
  }, [createUserMessage, createAIMessage, processAIResponse, toast]);

  return {
    isProcessing,
    setIsProcessing,
    createUserMessage,
    createAIMessage,
    processMessage
  };
};
