
import React, { FormEvent } from 'react';
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
  // Handle sending message with proper scroll reset
  const handleSendWithScrollReset = (e: FormEvent) => {
    // Reset scroll state on send
    handleSendMessage(e);
  };
  
  // Handle image upload with proper typing
  const handleImageUploadWrapper = (file: File, prompt?: string) => {
    handleImageUpload(file, prompt);
  };
  
  return (
    <div className="border-t border-border bg-background/95 backdrop-blur-sm py-4">
      <div className={`max-w-3xl mx-auto px-4 sm:px-0 ${sidebarState === 'collapsed' ? 'lg:mx-auto' : 'lg:ml-0 lg:mr-auto'}`}>
        <ChatInput
          input={input}
          setInput={setInput}
          handleSendMessage={handleSendWithScrollReset}
          handleImageUpload={handleImageUploadWrapper}
          handleListingAnalysis={handleListingAnalysis}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

export default ChatInputContainer;
