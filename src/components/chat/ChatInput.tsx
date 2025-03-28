
import React, { useState, FormEvent } from 'react';
import { Textarea } from '@/components/ui/textarea';
import ImageUpload from './ImageUpload';
import ChatActions from './ChatActions';

interface ChatInputProps {
  input: string;
  setInput: (input: string) => void;
  handleSendMessage: (e: FormEvent) => void;
  handleImageUpload?: (file: File) => void;
  handleListingAnalysis?: (url: string) => void;
  isLoading?: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({
  input,
  setInput,
  handleSendMessage,
  handleImageUpload,
  handleListingAnalysis,
  isLoading = false,
}) => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if ((input.trim() || selectedImage) && !isLoading) {
        submitMessage(e);
      }
    }
  };

  const handleVoiceTranscription = (text: string) => {
    setInput(text);
  };

  const handleImageSelected = (file: File) => {
    setSelectedImage(file);
    
    // Suggest a prompt if empty
    if (!input.trim()) {
      setInput("Can you identify this car part?");
    }
  };

  const handleImageRemoved = () => {
    setSelectedImage(null);
  };

  const handleUrlSubmit = (url: string) => {
    if (handleListingAnalysis) {
      handleListingAnalysis(url);
    }
  };

  const submitMessage = (e: FormEvent) => {
    if (selectedImage && handleImageUpload) {
      handleImageUpload(selectedImage);
      setSelectedImage(null);
    } else if (input.trim()) {
      handleSendMessage(e);
    }
  };

  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    if ((input.trim() || selectedImage) && !isLoading) {
      submitMessage(e);
    }
  };

  // Fix the type mismatch by creating a wrapper function that doesn't require an event parameter
  const handleSubmitAction = () => {
    // Create a synthetic event to pass to submitMessage
    const syntheticEvent = { preventDefault: () => {} } as FormEvent;
    submitMessage(syntheticEvent);
  };

  return (
    <form onSubmit={handleFormSubmit} className="relative max-w-3xl mx-auto transition-all duration-300 animate-fade-in">
      {selectedImage && (
        <div className="mb-2 relative">
          <ImageUpload
            onImageSelected={handleImageSelected}
            onImageRemoved={handleImageRemoved}
            onSuggestPrompt={setInput}
            disabled={isLoading}
          />
        </div>
      )}
      
      <div className="relative border border-input rounded-lg shadow-sm">
        <Textarea
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={selectedImage ? "Ask about this part..." : "Ask me anything about your vehicle..."}
          className="min-h-12 max-h-40 resize-none py-3 pr-24 pl-3 rounded-lg"
          disabled={isLoading}
        />
        
        <ChatActions
          input={input}
          hasSelectedImage={!!selectedImage}
          onSubmit={handleSubmitAction}
          onImageSelected={handleImageSelected}
          onImageRemoved={handleImageRemoved}
          onUrlSubmit={handleUrlSubmit}
          onVoiceTranscription={handleVoiceTranscription}
          onSuggestPrompt={setInput}
          isLoading={isLoading}
        />
      </div>
    </form>
  );
};

export default ChatInput;
