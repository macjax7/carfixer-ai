
import React, { useState, FormEvent } from 'react';
import { Send, Image, Mic } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import VoiceInput from './VoiceInput';

interface ChatInputProps {
  input: string;
  setInput: (input: string) => void;
  handleSendMessage: (e: FormEvent) => void;
  handleImageUpload?: () => void;
  isLoading?: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({
  input,
  setInput,
  handleSendMessage,
  handleImageUpload,
  isLoading = false,
}) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (input.trim() && !isLoading) {
        handleSendMessage(e as unknown as FormEvent);
      }
    }
  };

  const handleVoiceTranscription = (text: string) => {
    setInput(text);
  };

  return (
    <form onSubmit={handleSendMessage} className="relative max-w-3xl mx-auto">
      <div className="relative border border-input rounded-lg shadow-sm">
        <Textarea
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Ask me anything about your vehicle..."
          className="min-h-12 max-h-40 resize-none py-3 pr-24 pl-3 rounded-lg"
          disabled={isLoading}
        />
        
        <div className="absolute right-2 bottom-1.5 flex items-center space-x-1">
          {handleImageUpload && (
            <button
              type="button"
              onClick={handleImageUpload}
              className="p-2 rounded-full text-muted-foreground hover:text-primary hover:bg-muted transition-colors"
              disabled={isLoading}
              aria-label="Upload image"
            >
              <Image className="h-5 w-5" />
            </button>
          )}
          
          <VoiceInput
            onTranscription={handleVoiceTranscription}
            disabled={isLoading}
          />
          
          <button
            type="submit"
            className={`p-2 rounded-full ${
              input.trim() && !isLoading
                ? 'bg-carfix-600 text-white hover:bg-carfix-700'
                : 'bg-muted text-muted-foreground'
            } transition-colors`}
            disabled={!input.trim() || isLoading}
            aria-label="Send message"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </div>
    </form>
  );
};

export default ChatInput;
