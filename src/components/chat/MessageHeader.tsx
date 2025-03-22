
import React from 'react';
import { Sparkles } from 'lucide-react';

interface MessageHeaderProps {
  sender: 'user' | 'ai';
}

const MessageHeader: React.FC<MessageHeaderProps> = ({ sender }) => {
  if (sender !== 'ai') return null;
  
  return (
    <div className="flex items-center mb-2">
      <Sparkles className="h-4 w-4 text-carfix-500 mr-2" />
      <span className="text-xs font-medium text-carfix-500">CarFix AI</span>
    </div>
  );
};

export default MessageHeader;
