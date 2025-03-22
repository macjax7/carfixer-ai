
import React, { useState, FormEvent, useRef } from 'react';
import { Send, Image, Mic, X } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import VoiceInput from './VoiceInput';
import { useToast } from '@/components/ui/use-toast';

interface ChatInputProps {
  input: string;
  setInput: (input: string) => void;
  handleSendMessage: (e: FormEvent) => void;
  handleImageUpload?: (file: File) => void;
  isLoading?: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({
  input,
  setInput,
  handleSendMessage,
  handleImageUpload,
  isLoading = false,
}) => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if ((input.trim() || selectedImage) && !isLoading) {
        submitMessage();
      }
    }
  };

  const handleVoiceTranscription = (text: string) => {
    setInput(text);
  };

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file",
        variant: "destructive"
      });
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Image size should be less than 5MB",
        variant: "destructive"
      });
      return;
    }
    
    setSelectedImage(file);
    setPreviewUrl(URL.createObjectURL(file));
    
    // Suggest a prompt if empty
    if (!input.trim()) {
      setInput("Can you identify this car part?");
    }
    
    // Reset the file input so the same file can be selected again
    e.target.value = '';
  };

  const removeSelectedImage = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedImage(null);
    setPreviewUrl(null);
  };

  const submitMessage = () => {
    if (selectedImage && handleImageUpload) {
      handleImageUpload(selectedImage);
      removeSelectedImage();
    } else {
      handleSendMessage(new Event('submit') as unknown as FormEvent);
    }
  };

  return (
    <form onSubmit={handleSendMessage} className="relative max-w-3xl mx-auto">
      {previewUrl && (
        <div className="mb-2 relative">
          <div className="relative inline-block">
            <img 
              src={previewUrl} 
              alt="Selected" 
              className="h-20 rounded-md object-contain bg-secondary/30 border border-border"
            />
            <button
              type="button"
              onClick={removeSelectedImage}
              className="absolute -top-2 -right-2 bg-background rounded-full p-1 shadow-sm border border-border"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
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
        
        <div className="absolute right-2 bottom-1.5 flex items-center space-x-1">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
          
          <button
            type="button"
            onClick={openFilePicker}
            className="p-2 rounded-full text-muted-foreground hover:text-primary hover:bg-muted transition-colors"
            disabled={isLoading}
            aria-label="Upload image"
          >
            <Image className="h-5 w-5" />
          </button>
          
          <VoiceInput
            onTranscription={handleVoiceTranscription}
            disabled={isLoading}
          />
          
          <button
            type="button"
            onClick={submitMessage}
            className={`p-2 rounded-full ${
              (input.trim() || selectedImage) && !isLoading
                ? 'bg-carfix-600 text-white hover:bg-carfix-700'
                : 'bg-muted text-muted-foreground'
            } transition-colors`}
            disabled={!input.trim() && !selectedImage || isLoading}
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
