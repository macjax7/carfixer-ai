
import { useCallback } from "react";
import { v4 as uuidv4 } from 'uuid';
import { useChatMessages } from "./useChatMessages";
import { useAuth } from '@/context/AuthContext';
import { useChatDatabase } from "./useChatDatabase";
import { useMessageProcessor } from "./useMessageProcessor";
import { useErrorHandler } from "./useErrorHandler";

export const useMessageSender = () => {
  const { user } = useAuth();
  const { addUserMessage, addAIMessage, chatId, setChatId } = useChatMessages();
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
      
      // Add user message to the chat
      const userMessageData = processUserMessage(text, image);
      
      console.log("Adding user message to chat:", userMessageData);
      addUserMessage(userMessageData);
      
      // Also add it to the database
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
        console.log("Sending message to OpenAI:", text);
        const { text: aiResponseText, extra: aiMessageExtra } = await processAIResponse(text, image);
        console.log("Received AI response:", aiResponseText?.substring(0, 50) + "...");
        
        // Add AI response to the chat
        const aiMessageData = createAIMessage(aiResponseText, aiMessageExtra);
        
        console.log("Adding AI response to chat:", aiMessageData);
        addAIMessage(aiMessageData);
        
        // Also add it to the database
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
        
        // Show error message
        const errorMessageData = createAIMessage(errorMessage);
        addAIMessage(errorMessageData);
        
        return errorMessageData;
      }
    } catch (error) {
      console.error("Error in processAndSendMessage:", error);
      handleChatError(error, "Error processing message");
      
      // Show error message
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

  return {
    processAndSendMessage,
    isProcessing
  };
};
