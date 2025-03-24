
import React from 'react';
import { FormEvent } from 'react';
import ChatInput from './ChatInput';
import SuggestedPrompts from './SuggestedPrompts';

interface EmptyChatProps {
  input: string;
  setInput: (input: string) => void;
  handleSendMessage: (e: FormEvent) => void;
  handleImageUpload: (file: File, prompt?: string) => void;
  handleListingAnalysis: (url: string) => void;
  handleSuggestedPrompt: (prompt: string) => void;
  suggestedPrompts: string[];
  isLoading: boolean;
}

const EmptyChat: React.FC<EmptyChatProps> = ({
  input,
  setInput,
  handleSendMessage,
  handleImageUpload,
  handleListingAnalysis,
  handleSuggestedPrompt,
  suggestedPrompts,
  isLoading,
}) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 animate-fade-in max-w-3xl mx-auto w-full" style={{ marginTop: '-15vh' }}>
      <h1 className="text-4xl font-semibold text-foreground text-center mb-8">
        How can I help with your vehicle?
      </h1>
      
      {/* Input form for empty state - centered position */}
      <div className="w-full max-w-2xl px-4 sm:px-0">
        <ChatInput
          input={input}
          setInput={setInput}
          handleSendMessage={handleSendMessage}
          handleImageUpload={handleImageUpload}
          handleListingAnalysis={handleListingAnalysis}
          isLoading={isLoading}
        />
        
        {/* Show suggested prompts below the input in empty chat state */}
        <div className="mt-6">
          <SuggestedPrompts 
            handleSuggestedPrompt={handleSuggestedPrompt}
            prompts={suggestedPrompts}
          />
        </div>
      </div>
    </div>
  );
};

export default EmptyChat;
