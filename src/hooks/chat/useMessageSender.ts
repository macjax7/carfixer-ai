
import { useCallback, useState } from "react";
import { useChatMessages } from "./useChatMessages";
import { useAuth } from '@/context/AuthContext';
import { useChatDatabase } from "./useChatDatabase";
import { useMessageProcessor } from "./useMessageProcessor";
import { useErrorHandler } from "./useErrorHandler";
import { useVehicles } from '@/hooks/use-vehicles';
import { useChatSession } from "./useChatSession";
import { useVehicleExtractor } from "./useVehicleExtractor";
import { v4 as uuidv4 } from 'uuid';
import { useToast } from '@/hooks/use-toast';

export const useMessageSender = () => {
  const { user } = useAuth();
  const { addUserMessage, addAIMessage, chatId, setChatId, messages } = useChatMessages();
  const { vehicles, selectedVehicle } = useVehicles();
  const [vehicleContext, setVehicleContext] = useState<any>(selectedVehicle || null);
  const { toast } = useToast();
  
  const { 
    isProcessing, 
    setIsProcessing,
    processUserMessage,
    processAIResponse,
    createAIMessage
  } = useMessageProcessor();
  
  const { addToChatHistory } = useChatDatabase();
  const { handleChatError, handleAIProcessingError } = useErrorHandler();
  const { ensureChatSession, updateSessionTitle } = useChatSession(chatId, setChatId);
  const { extractVehicleInfo } = useVehicleExtractor();

  // Helper function to get vehicle context from messages
  const getVehicleContextFromMessages = useCallback(() => {
    // First check if we already have a vehicle context
    if (vehicleContext) {
      console.log("Using existing vehicle context:", vehicleContext);
      return vehicleContext;
    }
    
    // Then check if the user has a selected vehicle
    if (selectedVehicle) {
      console.log("Using selected vehicle as context:", selectedVehicle);
      setVehicleContext(selectedVehicle);
      return selectedVehicle;
    }
    
    // Otherwise scan through messages to find vehicle mentions
    console.log("Scanning message history for vehicle context...");
    for (let i = messages.length - 1; i >= 0; i--) {
      const message = messages[i];
      if (message.sender === 'user') {
        const extractedInfo = extractVehicleInfo(message.text);
        if (extractedInfo) {
          console.log("Found vehicle context in message history:", extractedInfo);
          setVehicleContext(extractedInfo);
          return extractedInfo;
        }
      }
    }
    
    console.log("No vehicle context found in message history");
    return null;
  }, [messages, extractVehicleInfo, selectedVehicle, vehicleContext]);

  const processAndSendMessage = useCallback(async (text: string, image?: string) => {
    if (!text.trim() && !image) return;
    
    setIsProcessing(true);
    console.log("Processing message:", text, image ? "(with image)" : "");
    
    try {
      // Ensure we have a chat ID - always generate a valid UUID
      let currentChatId = chatId;
      if (!currentChatId) {
        currentChatId = uuidv4();
        setChatId(currentChatId);
        console.log("Generated new chat ID:", currentChatId);
      } else {
        // Ensure chatId is a valid UUID
        const isValidUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(currentChatId);
        if (!isValidUUID) {
          console.warn("Current chatId is not a valid UUID:", currentChatId);
          currentChatId = uuidv4();
          setChatId(currentChatId);
          console.log("Generated new UUID-formatted chat ID:", currentChatId);
        }
      }
      
      // Create or ensure chat ID exists with proper UUID format for authenticated users
      if (user && user.id) {
        console.log("User is authenticated, ensuring chat session exists", { userId: user.id });
        currentChatId = await ensureChatSession(text, user.id);
        console.log("Ensured chat session exists:", currentChatId);
        
        // Update title if this is the first message in an existing chat
        await updateSessionTitle(currentChatId, text, user.id);
      }
      
      // Create user message data with a valid UUID
      const userMessageId = uuidv4();
      console.log("Generated message ID:", userMessageId);
      
      const userMessageData = {
        ...processUserMessage(text, image),
        id: userMessageId
      };
      
      console.log("Created user message data:", userMessageData);
      
      // Add user message to the chat UI first, before sending to API
      console.log("Adding user message to local UI state:", userMessageData);
      addUserMessage(userMessageData);
      
      // Extract vehicle information from the message and store it
      const newVehicleInfo = extractVehicleInfo(text, selectedVehicle);
      if (newVehicleInfo) {
        console.log("Extracted new vehicle info:", newVehicleInfo);
        setVehicleContext(newVehicleInfo);
      }
      
      // Use extracted vehicle info or look through previous messages
      const effectiveVehicleInfo = newVehicleInfo || getVehicleContextFromMessages();
      console.log("Using vehicle context for API call:", effectiveVehicleInfo);
      
      // Also add it to the database if user is logged in
      if (user && currentChatId) {
        try {
          console.log("Attempting to add user message to database history...");
          await addToChatHistory(currentChatId, userMessageData, 'user');
          console.log("User message added to database with chat ID:", currentChatId);
        } catch (error) {
          console.error("Error adding user message to history:", error);
          toast({
            title: "Message Storage Error",
            description: "Failed to save your message to history. Please try again.",
            variant: "destructive"
          });
          // Continue even if this fails
        }
      }
      
      // Process the message and get AI response
      try {
        console.log("Sending message to OpenAI with vehicle context:", effectiveVehicleInfo);
        
        const { text: aiResponseText, extra: aiMessageExtra } = await processAIResponse(text, image, effectiveVehicleInfo);
        console.log("Received AI response:", aiResponseText?.substring(0, 50) + "...");
        
        // Add AI response to the chat UI with a valid UUID
        const aiMessageId = uuidv4();
        const aiMessageData = {
          ...createAIMessage(aiResponseText || "Sorry, I couldn't process your request. Please try again.", aiMessageExtra),
          id: aiMessageId
        };
        
        console.log("Adding AI response to local UI state:", aiMessageData);
        addAIMessage(aiMessageData);
        
        // Also add it to the database if user is logged in
        if (user && currentChatId) {
          try {
            console.log("Attempting to add AI response to database history...");
            await addToChatHistory(currentChatId, aiMessageData, 'assistant');
            console.log("AI message added to database with chat ID:", currentChatId);
          } catch (error) {
            console.error("Error adding AI message to history:", error);
            // Continue even if this fails
          }
        }
        
        return aiMessageData;
      } catch (error) {
        console.error("AI processing error:", error);
        const errorMessage = handleAIProcessingError(error);
        
        // Show error message in the chat with a valid UUID
        const errorMessageId = uuidv4();
        const errorMessageData = {
          ...createAIMessage(errorMessage),
          id: errorMessageId
        };
        
        addAIMessage(errorMessageData);
        
        return errorMessageData;
      }
    } catch (error) {
      console.error("Error in processAndSendMessage:", error);
      handleChatError(error, "Error processing message");
      
      // Show error message in the chat with a valid UUID
      const errorMessageId = uuidv4();
      const errorMessageData = {
        ...createAIMessage(
          "I'm sorry, I encountered an error processing your request. Please try again."
        ),
        id: errorMessageId
      };
      
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
    messages,
    processUserMessage,
    processAIResponse, 
    createAIMessage,
    addToChatHistory,
    handleChatError,
    handleAIProcessingError,
    setIsProcessing,
    ensureChatSession,
    updateSessionTitle,
    extractVehicleInfo,
    getVehicleContextFromMessages,
    toast
  ]);

  return {
    processAndSendMessage,
    isProcessing,
    extractVehicleInfo,
    vehicleContext
  };
};
