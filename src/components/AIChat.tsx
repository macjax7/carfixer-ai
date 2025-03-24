
import React, { memo } from 'react';
import ChatContainer from './chat/ChatContainer';
import SimpleChatContainer from './chat/SimpleChatContainer';
import { useAuth } from '@/context/AuthContext';

const AIChat: React.FC = () => {
  const { user } = useAuth();
  
  // Use the more stable SimpleChatContainer regardless of auth status
  // This ensures consistent behavior for all users
  return (
    <div className="h-full">
      <SimpleChatContainer />
    </div>
  );
};

export default memo(AIChat);
