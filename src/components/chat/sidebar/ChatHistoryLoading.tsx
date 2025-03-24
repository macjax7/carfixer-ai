
import React from 'react';
import { Loader2 } from 'lucide-react';

const ChatHistoryLoading: React.FC = () => {
  return (
    <div className="p-3 text-center">
      <Loader2 className="h-6 w-6 mx-auto mb-2 animate-spin opacity-50" />
      <p className="text-sm text-muted-foreground">Loading chats...</p>
    </div>
  );
};

export default ChatHistoryLoading;
