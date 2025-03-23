
import React, { useRef, useEffect } from 'react';
import { ScrollArea } from './ui/scroll-area';
import ChatMessage from './chat/ChatMessage';
import ChatInput from './chat/ChatInput';
import SuggestedPrompts from './chat/SuggestedPrompts';
import LoadingIndicator from './chat/LoadingIndicator';
import { useChat } from '@/hooks/chat/useChat';
import { useVehicles } from '@/hooks/use-vehicles';
import { useSidebar } from '@/components/ui/sidebar';
import { useParams } from 'react-router-dom';

const AIChat: React.FC = () => {
  const { chatId } = useParams<{ chatId?: string }>();
  const {
    messages,
    input,
    setInput,
    isLoading,
    handleSendMessage,
    handleImageUpload,
    handleListingAnalysis,
    handleSuggestedPrompt,
    suggestedPrompts,
    hasAskedForVehicle,
    loadChatById,
    chatIdLoaded
  } = useChat();
  
  const { state } = useSidebar();
  const { vehicles, selectedVehicle } = useVehicles();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Chat state - empty or has messages
  const isEmptyChat = messages.length === 0 && !isLoading;
  
  // Load specific chat if chatId is provided in URL
  useEffect(() => {
    if (chatId && chatId !== chatIdLoaded) {
      loadChatById(chatId);
    }
  }, [chatId, loadChatById, chatIdLoaded]);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);
  
  // Generate vehicle suggestions if the AI has asked for vehicle info
  const getVehicleSuggestions = () => {
    if (!hasAskedForVehicle || vehicles.length === 0) return null;
    
    return (
      <div className="flex flex-wrap gap-2 mt-2 mb-4 max-w-3xl mx-auto">
        {vehicles.map(vehicle => (
          <button
            key={vehicle.id}
            className="bg-carfix-100 hover:bg-carfix-200 text-carfix-900 px-3 py-1.5 rounded-full text-sm transition-colors"
            onClick={() => {
              setInput(`I'm working on my ${vehicle.year} ${vehicle.make} ${vehicle.model}${vehicle.nickname ? ` (${vehicle.nickname})` : ''}`);
            }}
          >
            {vehicle.year} {vehicle.make} {vehicle.model}
            {vehicle.nickname ? ` (${vehicle.nickname})` : ''}
          </button>
        ))}
        <button
          className="bg-secondary hover:bg-secondary/80 text-foreground px-3 py-1.5 rounded-full text-sm transition-colors"
          onClick={() => {
            setInput("I'm working on a different vehicle");
          }}
        >
          Different vehicle
        </button>
      </div>
    );
  };
  
  return (
    <div className={`flex flex-col h-full bg-background pt-14 ${isEmptyChat ? 'justify-center' : ''}`}> {/* Added justify-center for empty state */}
      {/* Welcome message when no messages exist - centered in empty state */}
      {isEmptyChat ? (
        <div className="flex-1 flex flex-col items-center justify-center px-4 pb-24 animate-fade-in">
          <SuggestedPrompts 
            handleSuggestedPrompt={handleSuggestedPrompt}
            prompts={suggestedPrompts}
          />
        </div>
      ) : (
        /* Chat messages - show when there are messages */
        <ScrollArea className="flex-1 pt-4 px-2 md:px-4 pb-4">
          <div className={`max-w-3xl mx-auto space-y-6 pb-4 ${state === 'collapsed' ? 'lg:mx-auto' : 'lg:ml-0 lg:mr-auto'}`}>
            {messages.map((msg) => (
              <ChatMessage 
                key={msg.id}
                id={msg.id}
                sender={msg.sender}
                text={msg.text}
                timestamp={msg.timestamp}
                image={msg.image}
                componentDiagram={msg.componentDiagram}
                vehicleListingAnalysis={msg.vehicleListingAnalysis}
              />
            ))}
            
            {/* Vehicle suggestions when AI has asked for vehicle info */}
            {hasAskedForVehicle && getVehicleSuggestions()}
            
            {isLoading && <LoadingIndicator />}
            
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      )}
      
      {/* Input form - positioned conditionally based on chat state */}
      <div 
        className={`
          border-t border-border bg-background/95 backdrop-blur-sm py-3 px-3 md:px-4
          ${isEmptyChat 
            ? 'absolute bottom-1/3 left-0 right-0 border-t-0 transition-all duration-300' 
            : 'mt-auto transition-all duration-300'
          }
        `}
      >
        <div className={`max-w-3xl ${state === 'collapsed' ? 'mx-auto' : 'lg:ml-0 lg:mr-auto'}`}>
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
    </div>
  );
};

export default AIChat;
