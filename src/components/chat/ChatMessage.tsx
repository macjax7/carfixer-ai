
import React from 'react';
import { cn } from '@/lib/utils';
import MessageHeader from './MessageHeader';
import ComponentDiagram from './ComponentDiagram';
import VehicleListingAnalysis from './VehicleListingAnalysis';

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
  return (
    <div 
      className={cn(
        "max-w-[85%] md:max-w-[75%] rounded-2xl px-4 py-3",
        sender === 'user' 
          ? "bg-carfix-600 text-white" 
          : "bg-secondary/80 border border-border"
      )}
    >
      <MessageHeader sender={sender} />
      
      {image && (
        <div className="mb-2">
          <img 
            src={image} 
            alt="Uploaded" 
            className="rounded-lg max-h-48 w-auto object-contain bg-black/10"
          />
        </div>
      )}
      
      <p className="text-sm md:text-base whitespace-pre-wrap">{text}</p>
      
      {componentDiagram && <ComponentDiagram componentDiagram={componentDiagram} />}
      
      {vehicleListingAnalysis && <VehicleListingAnalysis vehicleListingAnalysis={vehicleListingAnalysis} />}
      
      <p className="text-xs opacity-70 mt-1 text-right">
        {timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
      </p>
    </div>
  );
};

export default ChatMessage;
