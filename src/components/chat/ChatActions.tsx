
import React from 'react';
import { Send } from 'lucide-react';
import VoiceInput from './VoiceInput';
import ImageUpload from './ImageUpload';
import UrlAnalyzer from './UrlAnalyzer';

interface ChatActionsProps {
  input: string;
  hasSelectedImage: boolean;
  onSubmit: () => void;
  onImageSelected: (file: File) => void;
  onImageRemoved: () => void;
  onUrlSubmit: (url: string) => void;
  onVoiceTranscription: (text: string) => void;
  onSuggestPrompt: (text: string) => void;
  isLoading?: boolean;
}

const ChatActions: React.FC<ChatActionsProps> = ({
  input,
  hasSelectedImage,
  onSubmit,
  onImageSelected,
  onImageRemoved,
  onUrlSubmit,
  onVoiceTranscription,
  onSuggestPrompt,
  isLoading = false,
}) => {
  return (
    <div className="absolute right-2 bottom-1.5 flex items-center space-x-1">
      <UrlAnalyzer 
        onUrlSubmit={onUrlSubmit}
        disabled={isLoading} 
      />
      
      {!hasSelectedImage && (
        <ImageUpload
          onImageSelected={onImageSelected}
          onImageRemoved={onImageRemoved}
          onSuggestPrompt={onSuggestPrompt}
          disabled={isLoading}
        />
      )}
      
      <VoiceInput
        onTranscription={onVoiceTranscription}
        disabled={isLoading}
      />
      
      <button
        type="button"
        onClick={onSubmit}
        className={`p-2 rounded-full ${
          (input.trim() || hasSelectedImage) && !isLoading
            ? 'bg-carfix-600 text-white hover:bg-carfix-700'
            : 'bg-muted text-muted-foreground'
        } transition-colors`}
        disabled={(!input.trim() && !hasSelectedImage) || isLoading}
        aria-label="Send message"
      >
        <Send className="h-5 w-5" />
      </button>
    </div>
  );
};

export default ChatActions;
