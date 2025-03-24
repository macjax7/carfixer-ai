
import React from 'react';
import ChatInput from './ChatInput';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';

interface ChatInputContainerProps {
  input: string;
  setInput: (input: string) => void;
  handleSendMessage: (e: React.FormEvent) => void;
  handleImageUpload?: (file: File) => void;
  handleListingAnalysis?: (url: string) => void;
  isLoading?: boolean;
  sidebarState?: 'collapsed' | 'expanded';
  onNewChat?: () => void;
}

const ChatInputContainer: React.FC<ChatInputContainerProps> = ({
  input,
  setInput,
  handleSendMessage,
  handleImageUpload,
  handleListingAnalysis,
  isLoading = false,
  sidebarState = 'collapsed',
  onNewChat
}) => {
  return (
    <div className="border-t border-border bg-background/80 backdrop-blur-sm py-4">
      <div className="max-w-3xl mx-auto px-4">
        {onNewChat && (
          <div className="flex justify-center mb-4">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1"
              onClick={onNewChat}
            >
              <PlusCircle className="h-4 w-4" />
              <span>New Chat</span>
            </Button>
          </div>
        )}
        
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
