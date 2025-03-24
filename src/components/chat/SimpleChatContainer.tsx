
import React, { FormEvent, useEffect } from 'react';
import { useSidebar } from '@/components/ui/sidebar';
import { useDirectChatHandler } from '@/hooks/chat/useDirectChatHandler';
import EmptyChat from './EmptyChat';
import ChatThread from './ChatThread';
import ChatInputContainer from './ChatInputContainer';
import { useToast } from '@/hooks/use-toast';
import { useNavigate, useParams } from 'react-router-dom';

const SimpleChatContainer: React.FC = () => {
  const {
    messages,
    input,
    setInput,
    isProcessing,
    sendMessage,
    resetChat,
    loadChatById,
    chatId
  } = useDirectChatHandler();
  
  const { state } = useSidebar();
  const { toast } = useToast();
  const navigate = useNavigate();
  const params = useParams();
  
  // If there's a chat ID in the URL, load that chat
  useEffect(() => {
    if (params.id && params.id !== chatId) {
      loadChatById(params.id);
    }
  }, [params.id, loadChatById, chatId]);
  
  const handleSendMessage = (e: FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isProcessing) {
      sendMessage(input);
    }
  };
  
  const handleTextInput = (text: string) => {
    if (text.trim() && !isProcessing) {
      sendMessage(text);
    }
  };
  
  const handleImageUpload = (file: File) => {
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      
      // Create a prompt based on the current input or use a default
      const prompt = input.trim() 
        ? input 
        : "Can you identify this car part or issue?";
        
      sendMessage(prompt, imageUrl);
    }
  };
  
  const handleListingAnalysis = (url: string) => {
    if (url && !isProcessing) {
      toast({
        title: "Analyzing listing",
        description: "Analyzing vehicle listing data...",
      });
      sendMessage(`Can you analyze this vehicle listing? ${url}`);
    }
  };
  
  const handleSuggestedPrompt = (prompt: string) => {
    setInput(prompt);
  };
  
  const handleNewChat = () => {
    resetChat();
    setInput('');
    navigate('/');
  };
  
  // Determine if we're in an empty chat state
  const isEmptyChat = messages.length === 0;
  
  // Check if the user has asked about their vehicle
  const hasAskedForVehicle = messages.some(msg => 
    msg.sender === 'user' && 
    (msg.text.toLowerCase().includes('my car') || 
     msg.text.toLowerCase().includes('my vehicle') ||
     msg.text.toLowerCase().includes('my truck') ||
     msg.text.toLowerCase().includes('my suv'))
  );
  
  return (
    <div className={`flex flex-col h-full bg-background ${isEmptyChat ? 'justify-center' : ''}`}>
      {isEmptyChat ? (
        <EmptyChat
          input={input}
          setInput={setInput}
          handleSendMessage={handleSendMessage}
          handleImageUpload={handleImageUpload}
          handleListingAnalysis={handleListingAnalysis}
          handleSuggestedPrompt={handleSuggestedPrompt}
          suggestedPrompts={[
            "What's wrong with my car if it makes a grinding noise when braking?",
            "How do I change my car's oil?",
            "What could cause my check engine light to come on?",
            "How often should I rotate my tires?",
            "What's a good maintenance schedule for a 2018 Honda Civic?"
          ]}
          isLoading={isProcessing}
        />
      ) : (
        <>
          <ChatThread 
            messages={messages}
            isLoading={isProcessing}
            hasAskedForVehicle={hasAskedForVehicle}
            sidebarState={state}
          />
          <ChatInputContainer
            input={input}
            setInput={setInput}
            handleSendMessage={handleSendMessage}
            handleImageUpload={handleImageUpload}
            handleListingAnalysis={handleListingAnalysis}
            isLoading={isProcessing}
            sidebarState={state}
            onNewChat={handleNewChat}
          />
        </>
      )}
    </div>
  );
};

export default React.memo(SimpleChatContainer);
