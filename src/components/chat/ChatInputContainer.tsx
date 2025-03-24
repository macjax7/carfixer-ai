
import React from 'react';
import ChatInput from './ChatInput';

interface ChatInputContainerProps {
  input: string;
  setInput: (input: string) => void;
  handleSendMessage: (e: React.FormEvent) => void;
  handleImageUpload?: (file: File) => void;
  handleListingAnalysis?: (url: string) => void;
  isLoading?: boolean;
  sidebarState?: 'collapsed' | 'expanded';
}

const ChatInputContainer: React.FC<ChatInputContainerProps> = ({
  input,
  setInput,
  handleSendMessage,
  handleImageUpload,
  handleListingAnalysis,
  isLoading = false,
  sidebarState = 'collapsed'
}) => {
  return (
    <div className="border-t border-border bg-background/80 backdrop-blur-sm py-4">
      <div className="max-w-3xl mx-auto px-4">
        <ChatInput
          input={input}
          setInput={setInput}
          handleSendMessage={handleSendMessage}
          handleImageUpload={handleImageUpload}
          handleListingAnalysis={handleListingAnalysis}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

export default ChatInputContainer;
