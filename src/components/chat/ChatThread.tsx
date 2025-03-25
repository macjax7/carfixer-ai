
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
  
  // Memoize messages to prevent unnecessary re-renders
  const memoizedMessages = useMemo(() => messages, [messages]);
  
  // Improved scroll detection with debounce-like behavior
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (!scrollAreaRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    const scrollThreshold = 150; // slightly increased threshold
    
    // Update userScrolled state based on scroll position
    if (distanceFromBottom > scrollThreshold && !userScrolled) {
      setUserScrolled(true);
    } else if (distanceFromBottom <= scrollThreshold && userScrolled) {
      setUserScrolled(false);
    }
  };
  
  return (
    <div 
      className="flex-1 px-2 md:px-4 pb-4 overflow-auto"
      style={{ scrollPaddingTop: '6rem' }} // Fix for content hiding under header
      onScroll={handleScroll}
      ref={scrollAreaRef}
    >
      <div className={`max-w-3xl mx-auto space-y-6 pb-4 pt-24 ${sidebarState === 'collapsed' ? 'lg:mx-auto' : 'lg:ml-0 lg:mr-auto'}`}>
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
            videoRecommendations={msg.videoRecommendations}
            repairGuidance={msg.repairGuidance}
          />
        ))}
        
        {hasAskedForVehicle && <VehicleSuggestions setUserScrolled={setUserScrolled} />}
        
        {isLoading && messages.length > 0 && <LoadingIndicator />}
        
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

// Use React.memo to prevent unnecessary re-renders
export default React.memo(ChatThread);
