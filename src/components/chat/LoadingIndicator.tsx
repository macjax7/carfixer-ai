
import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingIndicator: React.FC = () => {
  return (
    <div className="flex justify-start chat-message">
      <div className="bg-secondary/80 border border-border rounded-2xl px-4 py-3 flex items-center space-x-2">
        <Loader2 className="h-4 w-4 animate-spin text-carfix-500" />
        <span className="text-sm">Thinking...</span>
      </div>
    </div>
  );
};

export default LoadingIndicator;
