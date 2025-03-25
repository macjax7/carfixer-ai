
import React, { memo } from 'react';
import ChatContainer from './chat/ChatContainer';
import SimpleChatContainer from './chat/SimpleChatContainer';
import { useAuth } from '@/context/AuthContext';
import { useLocation } from 'react-router-dom';

const AIChat: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  
  // Check if we're on the landing page
  const isLandingPage = location.pathname === '/';
  
  // Use the more stable SimpleChatContainer regardless of auth status
  // This ensures consistent behavior for all users
  return (
    <div className={`h-full ${isLandingPage && !user ? 'landing-chat' : ''}`}>
      <SimpleChatContainer />
    </div>
  );
};

export default memo(AIChat);
