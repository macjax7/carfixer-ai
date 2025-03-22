
import React from 'react';
import { cn } from '@/lib/utils';
import { Sparkles } from 'lucide-react';

interface MessageProps {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
}

const ChatMessage: React.FC<MessageProps> = ({ id, sender, text, timestamp }) => {
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
        <p className="text-sm md:text-base whitespace-pre-wrap">{text}</p>
        <p className="text-xs opacity-70 mt-1 text-right">
          {timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
        </p>
      </div>
    </div>
  );
};

export default ChatMessage;
