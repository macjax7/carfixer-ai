
import React, { FormEvent, memo } from 'react';
import ChatInput from './ChatInput';

interface ChatInputContainerProps {
  input: string;
  setInput: (input: string) => void;
  handleSendMessage: (e: FormEvent) => void;
  handleImageUpload: (file: File, prompt?: string) => void;
  handleListingAnalysis: (url: string) => void;
  isLoading: boolean;
  sidebarState: 'expanded' | 'collapsed';
}

const ChatInputContainer: React.FC<ChatInputContainerProps> = ({
  input,
  setInput,
  handleSendMessage,
  handleImageUpload,
  handleListingAnalysis,
  isLoading,
  sidebarState
}) => {
  // Wrapper for sending message that creates a proper synthetic event
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    handleSendMessage(e);
  };
  
  return (
    <div className="border-t border-border bg-background/95 backdrop-blur-sm py-4 sticky bottom-0 z-10">
      <div className={`max-w-3xl mx-auto px-4 sm:px-0 ${sidebarState === 'collapsed' ? 'lg:mx-auto' : 'lg:ml-0 lg:mr-auto'}`}>
        <ChatInput
          input={input}
          setInput={setInput}
          handleSendMessage={handleSubmit}
          handleImageUpload={handleImageUpload}
          handleListingAnalysis={handleListingAnalysis}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

// Use memo to prevent unnecessary re-renders
export default memo(ChatInputContainer);
