
import React, { useRef } from 'react';
import { Send, Image, Mic } from 'lucide-react';
import { Textarea } from '../ui/textarea';
import { cn } from '@/lib/utils';

interface ChatInputProps {
  input: string;
  setInput: (input: string) => void;
  handleSendMessage: (e: React.FormEvent) => void;
  handleImageUpload: () => void;
  isLoading: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ 
  input, 
  setInput, 
  handleSendMessage, 
  handleImageUpload, 
  isLoading 
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea as user types
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  };

  // Handle keyboard shortcut (Enter to send, Shift+Enter for new line)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !isLoading) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  return (
    <form onSubmit={handleSendMessage} className="max-w-3xl mx-auto relative">
      <div className="flex items-end rounded-xl border border-input bg-background focus-within:ring-1 focus-within:ring-carfix-500 focus-within:border-carfix-500 overflow-hidden">
        <button 
          type="button"
          onClick={handleImageUpload}
          className="p-3 text-muted-foreground hover:text-foreground transition-colors self-end"
          aria-label="Upload image"
        >
          <Image className="h-5 w-5" />
        </button>
        
        <Textarea
          ref={textareaRef}
          value={input}
          onChange={handleTextareaChange}
          onKeyDown={handleKeyDown}
          placeholder="Ask about your car problem..."
          className="flex-1 max-h-[120px] border-0 focus-visible:ring-0 resize-none py-3 px-0"
          rows={1}
        />
        
        <button 
          type="button"
          className="p-3 text-muted-foreground hover:text-foreground transition-colors self-end mr-1"
          aria-label="Voice input"
        >
          <Mic className="h-5 w-5" />
        </button>
        
        <button 
          type="submit"
          disabled={!input.trim() || isLoading}
          className={cn(
            "p-2 rounded-lg mr-2 mb-2 transition-colors",
            !input.trim() || isLoading
              ? "bg-secondary text-muted-foreground"
              : "bg-carfix-600 text-white hover:bg-carfix-700"
          )}
          aria-label="Send message"
        >
          <Send className="h-5 w-5" />
        </button>
      </div>
      
      <p className="text-xs text-muted-foreground text-center mt-2">
        CarFix AI may display inaccurate info. Always verify with manufacturer service manuals.
      </p>
    </form>
  );
};

export default ChatInput;
