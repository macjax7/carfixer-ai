
import React, { FormEvent } from 'react';
import { useSidebar } from '@/components/ui/sidebar';
import { useDirectChatHandler } from '@/hooks/chat/useDirectChatHandler';
import EmptyChat from './EmptyChat';
import ChatThread from './ChatThread';
import ChatInputContainer from './ChatInputContainer';

const SimpleChatContainer: React.FC = () => {
  const {
    messages,
    input,
    setInput,
    isProcessing,
    sendMessage
  } = useDirectChatHandler();
  
  const { state } = useSidebar();
  
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
      sendMessage(input, imageUrl);
    }
  };
  
  const handleListingAnalysis = (url: string) => {
    if (url && !isProcessing) {
      sendMessage(`Can you analyze this vehicle listing? ${url}`);
    }
  };
  
  const handleSuggestedPrompt = (prompt: string) => {
    setInput(prompt);
  };
  
  // Determine if we're in an empty chat state
  const isEmptyChat = messages.length === 0;
  
  // Dummy placeholder for vehicle context prompt
  const hasAskedForVehicle = false;
  
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
          />
        </>
      )}
    </div>
  );
};

export default React.memo(SimpleChatContainer);
