
import { FormEvent } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { useChatMessages } from './useChatMessages';
import { useMessageInput } from './useMessageInput';
import { useCodeDetection } from './useCodeDetection';
import { useOpenAI } from '@/utils/openai';
import { useVehicles } from '@/hooks/use-vehicles';
import { supabase } from '@/integrations/supabase/client';

export const useMessageSender = () => {
  const { toast } = useToast();
  const { chatWithAI } = useOpenAI();
  const { selectedVehicle } = useVehicles();
  const { addUserMessage, addAIMessage, getMessagesForAPI, messageHistory, chatId } = useChatMessages();
  const { input, setInput, isLoading, setIsLoading, setHasAskedForVehicle } = useMessageInput();
  const { containsDTCCode } = useCodeDetection();

  const handleSendMessage = async (e: FormEvent) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }
    
    console.log("handleSendMessage called with input:", input);
    if (!input.trim() || isLoading) {
      console.log("Input is empty or loading is in progress, returning");
      return;
    }
    
    const userMessage = addUserMessage(input);
    console.log("User message added:", userMessage);
    setInput('');
    setIsLoading(true);
    
    try {
      console.log("Preparing to send message to AI:", input);
      
      // Verify Supabase connection without querying a specific table
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          console.error("Supabase connection issue:", error);
          throw new Error(`Supabase connection issue: ${error.message}`);
        }
        console.log("Supabase connection verified");
      } catch (connectionError) {
        console.error("Error checking Supabase connection:", connectionError);
        // Continue anyway as this is just a connection check
      }
      
      // Store the message in the database if user is logged in
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData.session?.user) {
          // Check if we have a chat session for this chat
          let sessionId = chatId;

          // If not found, create a new chat session
          if (!sessionId) {
            const { data: newSession, error: sessionError } = await supabase
              .from('chat_sessions')
              .insert({
                title: input.length > 30 ? `${input.substring(0, 30)}...` : input,
                user_id: sessionData.session.user.id
              })
              .select('id')
              .single();
            
            if (sessionError) {
              console.error("Error creating chat session:", sessionError);
            } else {
              sessionId = newSession.id;
              console.log("Created new chat session:", sessionId);
            }
          }

          // Store the user message
          if (sessionId) {
            const { error: messageError } = await supabase
              .from('chat_messages')
              .insert({
                session_id: sessionId,
                role: 'user',
                content: input
              });
            
            if (messageError) {
              console.error("Error storing user message:", messageError);
            }
          }
        }
      } catch (dbError) {
        console.error("Error interacting with database:", dbError);
        // Continue with the AI interaction even if database storage fails
      }
      
      const apiMessages = getMessagesForAPI(userMessage);
      const containsCode = containsDTCCode(input);
      
      console.log("Calling OpenAI API with messages:", apiMessages);
      const aiResponse = await chatWithAI(apiMessages, true, selectedVehicle, messageHistory);
      console.log("Received AI response:", aiResponse);
      
      if (typeof aiResponse === 'object' && aiResponse.requestVehicleInfo) {
        setHasAskedForVehicle(true);
      }
      
      const aiMessageContent = typeof aiResponse === 'object' ? aiResponse.message : aiResponse;
      addAIMessage(aiMessageContent);
      
      // Store AI response in the database
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData.session?.user && chatId) {
          const { error: aiMessageError } = await supabase
            .from('chat_messages')
            .insert({
              session_id: chatId,
              role: 'assistant',
              content: aiMessageContent
            });
          
          if (aiMessageError) {
            console.error("Error storing AI message:", aiMessageError);
          }
        }
      } catch (dbError) {
        console.error("Error storing AI response:", dbError);
      }
    } catch (error) {
      console.error('Error getting AI response:', error);
      
      let errorMessage = "Sorry, I couldn't process your request. Please try again.";
      if (error instanceof Error) {
        errorMessage = error.message;
        console.error('Detailed error information:', error);
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
      
      // Add appropriate error message to the chat
      addAIMessage("I'm sorry, I encountered an error processing your request. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return { handleSendMessage };
};
