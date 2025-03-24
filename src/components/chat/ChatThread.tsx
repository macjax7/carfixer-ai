
import React, { useRef, useState, useEffect } from 'react';
import ChatMessage from './ChatMessage';
import LoadingIndicator from './LoadingIndicator';
import VehicleSuggestions from './VehicleSuggestions';
import { Message } from './types';

interface ChatThreadProps {
  messages: Message[];
  isLoading: boolean;
  hasAskedForVehicle: boolean;
  sidebarState: 'expanded' | 'collapsed';
}

const ChatThread: React.FC<ChatThreadProps> = ({ 
  messages, 
  isLoading, 
  hasAskedForVehicle,
  sidebarState
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [userScrolled, setUserScrolled] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const previousMessagesLengthRef = useRef<number>(messages.length);
  
  // Scroll to bottom only when new messages are added or when loading state changes
  useEffect(() => {
    // Only scroll if user hasn't manually scrolled up or when a new message is added
    if ((!userScrolled || messages.length > previousMessagesLengthRef.current || isLoading) && 
        messagesEndRef.current) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
    // Update previous message length after checking
    previousMessagesLengthRef.current = messages.length;
  }, [messages.length, isLoading, userScrolled]);
  
  // Reset userScrolled when user sends a new message
  useEffect(() => {
    if (isLoading) {
      setUserScrolled(false);
    }
  }, [isLoading]);
  
  // Detect when user has scrolled up
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (!scrollAreaRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    // Check if user has scrolled up (not at bottom)
    // Use a threshold to determine "close enough" to bottom
    const scrollThreshold = 100; // pixels from bottom to consider "at bottom"
    const isAtBottom = scrollHeight - scrollTop - clientHeight <= scrollThreshold;
    
    if (!isAtBottom && !userScrolled) {
      setUserScrolled(true);
    } else if (isAtBottom && userScrolled) {
      setUserScrolled(false);
    }
  };
  
  return (
    <div 
      className="flex-1 pt-24 px-2 md:px-4 pb-4 overflow-auto" 
      onScroll={handleScroll}
      ref={scrollAreaRef}
    >
      <div className={`max-w-3xl mx-auto space-y-6 pb-4 ${sidebarState === 'collapsed' ? 'lg:mx-auto' : 'lg:ml-0 lg:mr-auto'}`}>
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
        {hasAskedForVehicle && <VehicleSuggestions setUserScrolled={setUserScrolled} />}
        
        {/* Only show loading indicator when actually sending a message, not during initial load */}
        {isLoading && messages.length > 0 && <LoadingIndicator />}
        
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default ChatThread;
