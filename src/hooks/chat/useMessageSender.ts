import { useCallback } from "react";
import { useChatMessages } from "./useChatMessages";
import { useAuth } from '@/context/AuthContext';
import { useMessageProcessor } from "./useMessageProcessor";
import { useMessageId } from "./useMessageId";
import { useVehicleContext } from "./useVehicleContext";
import { useMessageErrorHandler } from "./useMessageErrorHandler";
import { useChatIdManager } from "./useChatIdManager";
import { useMessageDbOperations } from "./useMessageDbOperations";
import { ChatMessage } from "@/utils/openai/types";

export const useMessageSender = () => {
  const { user } = useAuth();
  const { addUserMessage, addAIMessage, chatId, setChatId, messages } = useChatMessages();
  const { generateMessageId } = useMessageId();
  const { isProcessing, setIsProcessing, processUserMessage, processAIResponse, createAIMessage } = useMessageProcessor();
  const { 
    vehicleContext, 
    updateVehicleContext, 
    getVehicleContextFromMessages,
    isVehicleLocked
  } = useVehicleContext();
  const { handleChatError, handleAIProcessingError } = useMessageErrorHandler();
  const { ensureChatId, ensureUserChatSession } = useChatIdManager(chatId, setChatId);
  const { saveUserMessage, saveAIMessage } = useMessageDbOperations();

  const processAndSendMessage = useCallback(async (text: string, image?: string) => {
    if (!text.trim() && !image) return;
    
    setIsProcessing(true);
    console.log("Processing message:", text, image ? "(with image)" : "");
    
    try {
      let currentChatId = ensureChatId();
      
      const userMessageId = generateMessageId();
      console.log("Generated message ID:", userMessageId);
      
      const userMessageData = {
        ...processUserMessage(text, image),
        id: userMessageId
      };
      
      console.log("Created user message data:", userMessageData);
      
      console.log("Adding user message to local UI state:", userMessageData);
      addUserMessage(userMessageData);
      
      const newVehicleInfo = updateVehicleContext(text);
      const isVehicleInfoLocked = isVehicleLocked();
      
      console.log("Vehicle context locked:", isVehicleInfoLocked);
      
      const effectiveVehicleInfo = newVehicleInfo || getVehicleContextFromMessages(messages);
      console.log("Using vehicle context for API call:", effectiveVehicleInfo);
      
      if (user && user.id) {
        currentChatId = await ensureUserChatSession(text, user.id);
        
        await saveUserMessage(currentChatId, userMessageData, user.id);
      }
      
      try {
        console.log("Sending message to OpenAI with vehicle context:", effectiveVehicleInfo);
        
        const messageHistory = messages.map(msg => ({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.text
        })) as ChatMessage[];
        
        const { text: aiResponseText, extra: aiMessageExtra } = await processAIResponse(
          text, 
          image, 
          effectiveVehicleInfo,
          messageHistory
        );
        
        console.log("Received AI response:", aiResponseText?.substring(0, 50) + "...");
        
        const aiMessageId = generateMessageId();
        const aiMessageData = {
          ...createAIMessage(aiResponseText || "Sorry, I couldn't process your request. Please try again.", aiMessageExtra),
          id: aiMessageId
        };
        
        console.log("Adding AI response to local UI state:", aiMessageData);
        addAIMessage(aiMessageData);
        
        if (user && user.id && currentChatId) {
          await saveAIMessage(currentChatId, aiMessageData, user.id);
        }
      } catch (error) {
        console.error("AI processing error:", error);
        const errorMessage = handleAIProcessingError(error);
        
        const errorMessageId = generateMessageId();
        const errorMessageData = {
          ...createAIMessage(errorMessage),
          id: errorMessageId
        };
        
        addAIMessage(errorMessageData);
      }
    } catch (error) {
      console.error("Error in processAndSendMessage:", error);
      handleChatError(error, "Error processing message");
      
      const errorMessageId = generateMessageId();
      const errorMessageData = {
        ...createAIMessage(
          "I'm sorry, I encountered an error processing your request. Please try again."
        ),
        id: errorMessageId
      };
      
      addAIMessage(errorMessageData);
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
    isVehicleLocked,
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
