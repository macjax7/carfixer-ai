
import React, { useRef, useEffect, useState } from 'react';
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
  const [userScrolled, setUserScrolled] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  // Chat state - empty or has messages
  const isEmptyChat = messages.length === 0;
  
  // Load specific chat if chatId is provided in URL - but don't show loading state
  useEffect(() => {
    if (chatId && chatId !== chatIdLoaded) {
      loadChatById(chatId);
    }
  }, [chatId, loadChatById, chatIdLoaded]);
  
  // Scroll to bottom when messages change, but only if not manually scrolled up
  useEffect(() => {
    if (!userScrolled || messages.length <= 1 || isLoading) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading, userScrolled]);
  
  // Reset user scrolled state when a new message is about to be sent
  useEffect(() => {
    if (isLoading) {
      setUserScrolled(false);
    }
  }, [isLoading]);
  
  // Handle scroll events to detect when user manually scrolls
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    const isScrolledUp = scrollHeight - scrollTop - clientHeight > 100;
    
    if (isScrolledUp && !userScrolled) {
      setUserScrolled(true);
    } else if (!isScrolledUp && userScrolled) {
      setUserScrolled(false);
    }
  };
  
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
              setUserScrolled(false); // Reset scroll state when selecting vehicle
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
            setUserScrolled(false); // Reset scroll state when selecting vehicle
          }}
        >
          Different vehicle
        </button>
      </div>
    );
  };
  
  return (
    <div className={`flex flex-col h-full bg-background ${isEmptyChat ? 'justify-center' : ''}`}>
      {/* Welcome message when no messages exist */}
      {isEmptyChat ? (
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
      ) : (
        /* Chat messages - show when there are messages */
        <>
          <div 
            className="flex-1 pt-4 px-2 md:px-4 pb-4 overflow-auto" 
            onScroll={handleScroll}
            ref={scrollAreaRef}
          >
            <div className={`max-w-3xl mx-auto space-y-6 pb-4 ${state === 'collapsed' ? 'lg:mx-auto' : 'lg:ml-0 lg:mr-auto'}`}>
              {messages.map((msg, index) => (
                <ChatMessage 
                  key={`${msg.id}-${index}`} // Using index to force re-render if needed
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
              
              {/* Only show loading indicator when actually sending a message, not during initial load */}
              {isLoading && messages.length > 0 && <LoadingIndicator />}
              
              <div ref={messagesEndRef} />
            </div>
          </div>
          
          {/* Input form - positioned at bottom for active chat */}
          <div className="border-t border-border bg-background/95 backdrop-blur-sm py-4">
            <div className={`max-w-3xl mx-auto px-4 sm:px-0 ${state === 'collapsed' ? 'lg:mx-auto' : 'lg:ml-0 lg:mr-auto'}`}>
              <ChatInput
                input={input}
                setInput={setInput}
                handleSendMessage={(e) => {
                  setUserScrolled(false); // Reset scroll state on send
                  handleSendMessage(e);
                }}
                handleImageUpload={(file, prompt) => {
                  setUserScrolled(false); // Reset scroll state on image upload
                  handleImageUpload(file, prompt);
                }}
                handleListingAnalysis={(url) => {
                  setUserScrolled(false); // Reset scroll state on listing analysis
                  handleListingAnalysis(url);
                }}
                isLoading={isLoading}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AIChat;
