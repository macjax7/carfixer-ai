
import { useCallback } from "react";
import { v4 as uuidv4 } from 'uuid';
import { useChatMessages } from "./useChatMessages";
import { useAuth } from '@/context/AuthContext';
import { useChatDatabase } from "./useChatDatabase";
import { useMessageProcessor } from "./useMessageProcessor";
import { useErrorHandler } from "./useErrorHandler";
import { useVehicles } from '@/hooks/use-vehicles';

export const useMessageSender = () => {
  const { user } = useAuth();
  const { addUserMessage, addAIMessage, chatId, setChatId } = useChatMessages();
  const { vehicles, selectedVehicle } = useVehicles();
  const { 
    isProcessing, 
    setIsProcessing,
    processUserMessage,
    processAIResponse,
    createAIMessage
  } = useMessageProcessor();
  
  const {
    addToChatHistory,
    createChatSession,
    updateChatSessionTitle,
    getChatMessageCount
  } = useChatDatabase();
  
  const { handleChatError, handleAIProcessingError } = useErrorHandler();

  const processAndSendMessage = useCallback(async (text: string, image?: string) => {
    if (!text.trim() && !image) return;
    
    setIsProcessing(true);
    console.log("Processing message:", text, image ? "(with image)" : "");
    
    try {
      // Create or ensure chat ID exists with proper UUID format
      let currentChatId = chatId;
      
      if (!currentChatId && user) {
        // Create a new chat session with a proper UUID
        const title = text.length > 30 
          ? text.substring(0, 30) + '...' 
          : text;
          
        const newChatId = await createChatSession(title, user.id);
        if (newChatId) {
          console.log("Created new chat session with ID:", newChatId);
          currentChatId = newChatId;
          setChatId(newChatId);
        } else {
          // If we couldn't create a session, use a temporary ID
          const tempId = uuidv4();
          console.log("Using temporary chat ID:", tempId);
          currentChatId = tempId;
          setChatId(tempId);
        }
      } else if (!currentChatId) {
        // For non-logged-in users, use a UUID
        const tempId = uuidv4();
        console.log("Using temporary chat ID for non-logged user:", tempId);
        currentChatId = tempId;
        setChatId(tempId);
      }
      
      // Update title if this is the first message in an existing chat
      if (user && currentChatId) {
        try {
          const messageCount = await getChatMessageCount(currentChatId);
          console.log("Current message count:", messageCount);
            
          if (messageCount === 0) {
            const title = text.length > 30 
              ? text.substring(0, 30) + '...' 
              : text;
              
            await updateChatSessionTitle(currentChatId, title);
          }
        } catch (error) {
          console.error("Error checking message count:", error);
          // Continue even if this fails
        }
      }
      
      // Add user message to the chat UI first, before sending to API
      const userMessageData = processUserMessage(text, image);
      
      console.log("Adding user message to chat:", userMessageData);
      addUserMessage(userMessageData);
      
      // Extract vehicle information from the message
      const vehicleInfo = extractVehicleInfo(text, selectedVehicle);
      
      // Also add it to the database if user is logged in
      if (user && currentChatId) {
        try {
          await addToChatHistory(currentChatId, userMessageData, 'user');
        } catch (error) {
          console.error("Error adding user message to history:", error);
          // Continue even if this fails
        }
      }
      
      // Process the message and get AI response
      try {
        console.log("Sending message to OpenAI with vehicle context:", vehicleInfo);
        const { text: aiResponseText, extra: aiMessageExtra } = await processAIResponse(text, image, vehicleInfo);
        console.log("Received AI response:", aiResponseText?.substring(0, 50) + "...");
        
        // Add AI response to the chat UI
        const aiMessageData = createAIMessage(aiResponseText, aiMessageExtra);
        
        console.log("Adding AI response to chat:", aiMessageData);
        addAIMessage(aiMessageData);
        
        // Also add it to the database if user is logged in
        if (user && currentChatId) {
          try {
            await addToChatHistory(currentChatId, aiMessageData, 'assistant');
          } catch (error) {
            console.error("Error adding AI message to history:", error);
            // Continue even if this fails
          }
        }
        
        return aiMessageData;
      } catch (error) {
        console.error("AI processing error:", error);
        const errorMessage = handleAIProcessingError(error);
        
        // Show error message in the chat
        const errorMessageData = createAIMessage(errorMessage);
        addAIMessage(errorMessageData);
        
        return errorMessageData;
      }
    } catch (error) {
      console.error("Error in processAndSendMessage:", error);
      handleChatError(error, "Error processing message");
      
      // Show error message in the chat
      const errorMessageData = createAIMessage(
        "I'm sorry, I encountered an error processing your request. Please try again."
      );
      
      addAIMessage(errorMessageData);
      return errorMessageData;
    } finally {
      setIsProcessing(false);
    }
  }, [
    chatId, 
    setChatId, 
    user, 
    selectedVehicle,
    addUserMessage, 
    addAIMessage, 
    processUserMessage, 
    processAIResponse, 
    createAIMessage,
    addToChatHistory,
    createChatSession,
    updateChatSessionTitle,
    getChatMessageCount,
    handleChatError,
    handleAIProcessingError,
    setIsProcessing
  ]);

  // Helper function to extract vehicle information from messages
  const extractVehicleInfo = (message: string, defaultVehicle: any = null) => {
    // If we already have a selected vehicle, use it as default
    if (defaultVehicle) {
      return defaultVehicle;
    }
    
    // Try to extract vehicle info from the message
    const yearPattern = /\b(19|20)\d{2}\b/;
    const yearMatch = message.match(yearPattern);
    
    // Common car makes for pattern matching
    const carMakes = [
      'toyota', 'honda', 'ford', 'chevrolet', 'chevy', 'nissan', 'hyundai', 'kia', 
      'subaru', 'bmw', 'mercedes', 'audi', 'lexus', 'acura', 'mazda', 'volkswagen', 
      'vw', 'jeep', 'ram', 'dodge', 'chrysler', 'buick', 'cadillac', 'gmc', 'infiniti'
    ];
    
    // Create regex pattern for makes
    const makePattern = new RegExp(`\\b(${carMakes.join('|')})\\b`, 'i');
    const makeMatch = message.match(makePattern);
    
    // If we found both year and make, try to extract model
    if (yearMatch && makeMatch) {
      const year = yearMatch[0];
      const make = makeMatch[0].toLowerCase();
      
      // Attempt to extract model - this is a simplified approach
      // Would need more sophisticated NLP for production use
      let modelMatch = null;
      
      // Common models by make
      const commonModels: Record<string, string[]> = {
        'toyota': ['camry', 'corolla', 'rav4', 'tacoma', 'tundra', 'highlander'],
        'honda': ['civic', 'accord', 'cr-v', 'pilot', 'odyssey'],
        'ford': ['f-150', 'mustang', 'escape', 'explorer', 'focus'],
        'chevrolet': ['silverado', 'equinox', 'malibu', 'tahoe'],
        'chevy': ['silverado', 'equinox', 'malibu', 'tahoe'],
        'nissan': ['altima', 'sentra', 'rogue', 'pathfinder'],
        'infiniti': ['g35', 'g37', 'q50', 'qx60', 'qx80', 'fx35']
        // Add more as needed
      };
      
      if (commonModels[make]) {
        for (const model of commonModels[make]) {
          if (message.toLowerCase().includes(model)) {
            modelMatch = model;
            break;
          }
        }
      }
      
      return {
        year,
        make: make.charAt(0).toUpperCase() + make.slice(1), // Capitalize make
        model: modelMatch || 'Unknown'
      };
    }
    
    // Return null if we couldn't extract vehicle info
    return null;
  };

  return {
    processAndSendMessage,
    isProcessing,
    extractVehicleInfo
  };
};
