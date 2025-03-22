
import React from 'react';
import { cn } from '@/lib/utils';
import { Sparkles, Map } from 'lucide-react';

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
}

const ChatMessage: React.FC<MessageProps> = ({ 
  id, 
  sender, 
  text, 
  timestamp, 
  image,
  componentDiagram 
}) => {
  return (
    <div 
      className={cn(
        "flex chat-message",
        sender === 'user' ? "justify-end" : "justify-start"
      )}
    >
      <div 
        className={cn(
          "max-w-[85%] md:max-w-[75%] rounded-2xl px-4 py-3",
          sender === 'user' 
            ? "bg-carfix-600 text-white" 
            : "bg-secondary/80 border border-border"
        )}
      >
        {sender === 'ai' && (
          <div className="flex items-center mb-2">
            <Sparkles className="h-4 w-4 text-carfix-500 mr-2" />
            <span className="text-xs font-medium text-carfix-500">CarFix AI</span>
          </div>
        )}
        
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
        
        {componentDiagram && (
          <div className="mt-4 border border-border/60 rounded-lg p-3 bg-background/50">
            <div className="flex items-center gap-2 mb-2 text-carfix-600">
              <Map className="h-4 w-4" />
              <h4 className="font-medium">{componentDiagram.componentName} Location</h4>
            </div>
            <p className="text-sm mb-2 text-muted-foreground">{componentDiagram.location}</p>
            <div className="rounded-md overflow-hidden border border-border/60">
              <img 
                src={componentDiagram.diagramUrl} 
                alt={`${componentDiagram.componentName} location`}
                className="w-full object-contain"
              />
            </div>
          </div>
        )}
        
        <p className="text-xs opacity-70 mt-1 text-right">
          {timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
        </p>
      </div>
    </div>
  );
};

export default ChatMessage;
