
import { useCallback } from "react";
import { nanoid } from "nanoid";
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
      // Create or ensure chat ID exists
      const newChatId = chatId || nanoid();
      if (!chatId) {
        console.log("Creating new chat with ID:", newChatId);
        setChatId(newChatId);
        
        // Create chat session in database with a descriptive title
        if (user) {
          try {
            const title = text.length > 30 
              ? text.substring(0, 30) + '...' 
              : text;
              
            await createChatSession(newChatId, title, user.id);
          } catch (error) {
            console.error('Error creating chat session:', error);
          }
        }
      } else {
        // Update the title when it's the first message in an existing chat
        if (user) {
          const messageCount = await getChatMessageCount(chatId);
            
          if (messageCount === 0) {
            const title = text.length > 30 
              ? text.substring(0, 30) + '...' 
              : text;
              
            await updateChatSessionTitle(chatId, title);
          }
        }
      }
      
      // Add user message to the chat
      const userMessageData = processUserMessage(text, image);
      
      console.log("Adding user message to chat:", userMessageData);
      addUserMessage(userMessageData);
      
      // Also add it to the database
      if (user) {
        await addToChatHistory(newChatId, userMessageData, 'user');
      }
      
      // Process the message and get AI response
      try {
        const { text: aiResponseText, extra: aiMessageExtra } = await processAIResponse(text, image);
        
        // Add AI response to the chat
        const aiMessageData = createAIMessage(aiResponseText, aiMessageExtra);
        
        console.log("Adding AI response to chat:", aiMessageData);
        addAIMessage(aiMessageData);
        
        // Also add it to the database
        if (user) {
          await addToChatHistory(newChatId, aiMessageData, 'assistant');
        }
        
        return aiMessageData;
      } catch (error) {
        const errorMessage = handleAIProcessingError(error);
        
        // Show error message
        const errorMessageData = createAIMessage(errorMessage);
        addAIMessage(errorMessageData);
        
        return errorMessageData;
      }
    } catch (error) {
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
