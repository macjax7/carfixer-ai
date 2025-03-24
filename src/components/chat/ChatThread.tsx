
import React, { useRef, useState, useEffect, useMemo } from 'react';
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
  const lastMessageIdRef = useRef<string | null>(null);
  const pendingScrollRef = useRef<boolean>(false);
  
  // Memoize messages to prevent unnecessary re-renders
  const memoizedMessages = useMemo(() => messages, [messages]);
  
  // This effect handles automatic scrolling based on specific conditions
  useEffect(() => {
    // Only check for new messages when messages array changes
    if (messages.length === 0) return;
    
    const lastMessage = messages[messages.length - 1];
    const lastMessageId = lastMessage?.id;
    const isNewMessage = lastMessageId !== lastMessageIdRef.current;
    
    // Only scroll if there's a new message and user hasn't scrolled up manually
    if (isNewMessage && (!userScrolled || isLoading)) {
      pendingScrollRef.current = true;
      
      // Update last message reference to prevent duplicate scrolling
      lastMessageIdRef.current = lastMessageId;
      
      // Use a slight delay to ensure the DOM has updated
      setTimeout(() => {
        if (pendingScrollRef.current && messagesEndRef.current) {
          messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
          pendingScrollRef.current = false;
        }
      }, 100);
    }
  }, [messages, isLoading, userScrolled]);
  
  // Reset userScrolled when user explicitly sends a new message
  useEffect(() => {
    if (isLoading) {
      setUserScrolled(false);
    }
  }, [isLoading]);
  
  // Detect when user has scrolled up
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (!scrollAreaRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    const scrollThreshold = 100; // pixels from bottom to consider "at bottom"
    const isAtBottom = scrollHeight - scrollTop - clientHeight <= scrollThreshold;
    
    // Only update state if the scrolled status changes to reduce renders
    if (!isAtBottom && !userScrolled) {
      setUserScrolled(true);
      pendingScrollRef.current = false; // Cancel any pending scrolls
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
        {memoizedMessages.map((msg) => (
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
        
        {hasAskedForVehicle && <VehicleSuggestions setUserScrolled={setUserScrolled} />}
        
        {isLoading && messages.length > 0 && <LoadingIndicator />}
        
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default React.memo(ChatThread);
