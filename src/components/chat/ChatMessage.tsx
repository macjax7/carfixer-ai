
import React from 'react';
import { cn } from '@/lib/utils';
import MessageHeader from './MessageHeader';
import ComponentDiagram from './ComponentDiagram';
import VehicleListingAnalysis from './VehicleListingAnalysis';
import MessageContent from './MessageContent';

interface MessageProps {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
  image?: string;
  componentDiagram?: {
    componentName: string;
    location: string;
    diagramUrl: string;
  };
  vehicleListingAnalysis?: {
    url: string;
    make?: string;
    model?: string;
    year?: number;
    mileage?: number;
    price?: number;
    vin?: string;
    description?: string;
    imageUrl?: string;
    analysis: {
      reliability: string;
      marketValue: string;
      maintenanceNeeds: string;
      redFlags: string;
      recommendation: string;
    };
  };
}

const ChatMessage: React.FC<MessageProps> = ({ 
  id, 
  sender, 
  text, 
  timestamp, 
  image,
  componentDiagram,
  vehicleListingAnalysis
}) => {
  // Ensure timestamp is a Date object before using Date methods
  const formattedTime = (): string => {
    if (timestamp instanceof Date) {
      return timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    } else if (typeof timestamp === 'string') {
      // If timestamp is a string, try to parse it as a date
      try {
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
      } catch (e) {
        console.error('Error parsing timestamp:', e);
        return ''; // Return empty string if parsing fails
      }
    } else {
      console.error('Invalid timestamp format:', timestamp);
      return ''; // Return empty string for invalid format
    }
  };

  return (
    <div className={cn(
      "flex chat-message", 
      sender === 'user' ? "justify-end" : "justify-start"
    )}>
      <div 
        className={cn(
          "max-w-[70%] rounded-2xl px-4 py-3",
          sender === 'user' 
            ? "bg-carfix-600 text-white rounded-tr-sm" 
            : "bg-secondary/80 border border-border rounded-tl-sm shadow-sm"
        )}
      >
        <MessageHeader sender={sender} />
        
        <MessageContent 
          text={text}
          image={image}
          sender={sender}
        />
        
        {componentDiagram && <ComponentDiagram componentDiagram={componentDiagram} />}
        
        {vehicleListingAnalysis && <VehicleListingAnalysis vehicleListingAnalysis={vehicleListingAnalysis} />}
        
        <p className={cn(
          "text-xs opacity-70 mt-1",
          sender === 'user' ? "text-right" : "text-left"
        )}>
          {formattedTime()}
        </p>
      </div>
    </div>
  );
};

// Wrap with React.memo to prevent unnecessary re-renders
export default React.memo(ChatMessage);
