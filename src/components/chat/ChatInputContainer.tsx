
import React, { FormEvent, useMemo, memo } from 'react';
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
  // Memoize event handler to prevent unnecessary re-renders
  const handleSubmit = useMemo(() => (e: FormEvent) => {
    e.preventDefault();
    handleSendMessage(e);
  }, [handleSendMessage]);
  
  // Use useMemo for container style classes to prevent unnecessary re-renders
  const containerClasses = useMemo(() => 
    `max-w-3xl mx-auto px-4 sm:px-0 ${sidebarState === 'collapsed' ? 'lg:mx-auto' : 'lg:ml-0 lg:mr-auto'}`,
  [sidebarState]);
  
  return (
    <div className="border-t border-border bg-background/95 backdrop-blur-sm py-4 sticky bottom-0 z-10">
      <div className={containerClasses}>
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

// Use memo to prevent unnecessary re-renders with custom comparison
export default memo(ChatInputContainer, (prevProps, nextProps) => {
  // Only re-render if these props change
  return (
    prevProps.input === nextProps.input &&
    prevProps.isLoading === nextProps.isLoading &&
    prevProps.sidebarState === nextProps.sidebarState
  );
});
