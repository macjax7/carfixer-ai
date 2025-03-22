
import React from 'react';
import { Wrench } from 'lucide-react';

const LoadingIndicator: React.FC = () => {
  return (
    <div className="flex justify-start chat-message">
      <div className="bg-secondary/80 border border-border rounded-2xl px-4 py-3 flex items-center space-x-2">
        <div className="relative">
          <Wrench className="h-5 w-5 text-carfix-500 animate-spin" style={{ animationDuration: '2s' }} />
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-carfix-500 rounded-full animate-pulse-light"></div>
        </div>
        <span className="text-sm">Thinking...</span>
      </div>
    </div>
  );
};

export default LoadingIndicator;
