
import { useCallback } from "react";
import { useChatMessages } from "./useChatMessages";
import { useAuth } from '@/context/AuthContext';
import { useChatDatabase } from "./useChatDatabase";
import { useMessageProcessor } from "./useMessageProcessor";
import { useErrorHandler } from "./useErrorHandler";
import { useVehicles } from '@/hooks/use-vehicles';
import { useChatSession } from "./useChatSession";
import { useVehicleExtractor } from "./useVehicleExtractor";

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
  
  const { addToChatHistory } = useChatDatabase();
  const { handleChatError, handleAIProcessingError } = useErrorHandler();
  const { ensureChatSession, updateSessionTitle } = useChatSession(chatId, setChatId);
  const { extractVehicleInfo } = useVehicleExtractor();

  const processAndSendMessage = useCallback(async (text: string, image?: string) => {
    if (!text.trim() && !image) return;
    
    setIsProcessing(true);
    console.log("Processing message:", text, image ? "(with image)" : "");
    
    try {
      // Create or ensure chat ID exists with proper UUID format
      const currentChatId = await ensureChatSession(text, user?.id);
      
      // Update title if this is the first message in an existing chat
      if (user && currentChatId) {
        await updateSessionTitle(currentChatId, text, user.id);
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
    user, 
    selectedVehicle,
    addUserMessage, 
    addAIMessage, 
    processUserMessage, 
    processAIResponse, 
    createAIMessage,
    addToChatHistory,
    handleChatError,
    handleAIProcessingError,
    setIsProcessing,
    ensureChatSession,
    updateSessionTitle,
    extractVehicleInfo
  ]);

  return {
    processAndSendMessage,
    isProcessing,
    extractVehicleInfo
  };
};
