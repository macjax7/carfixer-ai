
import React, { useRef, useEffect } from 'react';
import { ScrollArea } from './ui/scroll-area';
import ChatMessage from './chat/ChatMessage';
import ChatInput from './chat/ChatInput';
import SuggestedPrompts from './chat/SuggestedPrompts';
import LoadingIndicator from './chat/LoadingIndicator';
import { useChat } from './chat/useChat';

const AIChat: React.FC = () => {
  const {
    messages,
    input,
    setInput,
    isLoading,
    handleSendMessage,
    handleImageUpload,
    handleSuggestedPrompt,
    suggestedPrompts
  } = useChat();
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  return (
    <div className="flex flex-col h-full bg-background pt-14"> {/* Added pt-14 to account for header */}
      {/* Welcome message when no messages exist (except default) */}
      {messages.length === 1 && (
        <div className="flex-1 flex items-center justify-center">
          <SuggestedPrompts 
            handleSuggestedPrompt={handleSuggestedPrompt}
            prompts={suggestedPrompts}
          />
        </div>
      )}
      
      {/* Chat messages */}
      {messages.length > 1 && (
        <ScrollArea className="flex-1 pt-4 px-2 md:px-4 pb-4">
          <div className="max-w-3xl mx-auto space-y-6 pb-4">
            {messages.map((msg) => (
              <ChatMessage 
                key={msg.id}
                id={msg.id}
                sender={msg.sender}
                text={msg.text}
                timestamp={msg.timestamp}
              />
            ))}
            
            {isLoading && <LoadingIndicator />}
            
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      )}
      
      {/* Input form - ensure it stays at the bottom with proper spacing */}
      <div className="border-t border-border bg-background/95 backdrop-blur-sm py-3 px-3 md:px-4 mt-auto">
        <ChatInput
          input={input}
          setInput={setInput}
          handleSendMessage={handleSendMessage}
          handleImageUpload={handleImageUpload}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

export default AIChat;
