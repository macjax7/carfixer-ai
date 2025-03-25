
import { useCallback } from "react";
import { useChatMessages } from "./useChatMessages";
import { useAuth } from '@/context/AuthContext';
import { useMessageProcessor } from "./useMessageProcessor";
import { useMessageId } from "./useMessageId";
import { useVehicleContext } from "./useVehicleContext";
import { useMessageErrorHandler } from "./useMessageErrorHandler";
import { useChatIdManager } from "./useChatIdManager";
import { useMessageDbOperations } from "./useMessageDbOperations";

export const useMessageSender = () => {
  const { user } = useAuth();
  const { addUserMessage, addAIMessage, chatId, setChatId, messages } = useChatMessages();
  const { generateMessageId } = useMessageId();
  const { isProcessing, setIsProcessing, processUserMessage, processAIResponse, createAIMessage } = useMessageProcessor();
  const { vehicleContext, updateVehicleContext, getVehicleContextFromMessages } = useVehicleContext();
  const { handleChatError, handleAIProcessingError } = useMessageErrorHandler();
  const { ensureChatId, ensureUserChatSession } = useChatIdManager(chatId, setChatId);
  const { saveUserMessage, saveAIMessage } = useMessageDbOperations();

  // Main function to process and send messages
  const processAndSendMessage = useCallback(async (text: string, image?: string) => {
    if (!text.trim() && !image) return;
    
    setIsProcessing(true);
    console.log("Processing message:", text, image ? "(with image)" : "");
    
    try {
      // Ensure we have a valid chat ID
      let currentChatId = ensureChatId();
      
      // Create user message with a valid ID
      const userMessageId = generateMessageId();
      console.log("Generated message ID:", userMessageId);
      
      const userMessageData = {
        ...processUserMessage(text, image),
        id: userMessageId
      };
      
      console.log("Created user message data:", userMessageData);
      
      // Add user message to the chat UI first
      console.log("Adding user message to local UI state:", userMessageData);
      addUserMessage(userMessageData);
      
      // Extract vehicle information and update context
      const newVehicleInfo = updateVehicleContext(text);
      
      // Get effective vehicle context for API call
      const effectiveVehicleInfo = newVehicleInfo || getVehicleContextFromMessages(messages);
      console.log("Using vehicle context for API call:", effectiveVehicleInfo);
      
      // For authenticated users, ensure chat session exists and save message to database
      if (user && user.id) {
        currentChatId = await ensureUserChatSession(text, user.id);
        
        // Save user message to database
        await saveUserMessage(currentChatId, userMessageData, user.id);
      }
      
      // Process the message and get AI response
      try {
        console.log("Sending message to OpenAI with vehicle context:", effectiveVehicleInfo);
        
        const { text: aiResponseText, extra: aiMessageExtra } = await processAIResponse(text, image, effectiveVehicleInfo);
        console.log("Received AI response:", aiResponseText?.substring(0, 50) + "...");
        
        // Add AI response to the chat UI
        const aiMessageId = generateMessageId();
        const aiMessageData = {
          ...createAIMessage(aiResponseText || "Sorry, I couldn't process your request. Please try again.", aiMessageExtra),
          id: aiMessageId
        };
        
        console.log("Adding AI response to local UI state:", aiMessageData);
        addAIMessage(aiMessageData);
        
        // Save AI message to database for authenticated users
        if (user && user.id && currentChatId) {
          await saveAIMessage(currentChatId, aiMessageData, user.id);
        }
        
        return aiMessageData;
      } catch (error) {
        console.error("AI processing error:", error);
        const errorMessage = handleAIProcessingError(error);
        
        // Show error message in the chat
        const errorMessageId = generateMessageId();
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
      
      // Show error message in the chat
      const errorMessageId = generateMessageId();
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
    user,
    addUserMessage, 
    addAIMessage,
    messages,
    chatId,
    setChatId,
    processUserMessage,
    processAIResponse, 
    createAIMessage,
    handleChatError,
    handleAIProcessingError,
    setIsProcessing,
    generateMessageId,
    ensureChatId,
    ensureUserChatSession,
    updateVehicleContext,
    getVehicleContextFromMessages,
    saveUserMessage,
    saveAIMessage
  ]);

  return {
    processAndSendMessage,
    isProcessing,
    vehicleContext
  };
};
