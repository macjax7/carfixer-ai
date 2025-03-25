
import React, { memo } from 'react';
import SimpleChatContainer from './chat/SimpleChatContainer';
import { SidebarProvider } from '@/components/ui/sidebar';
import { useAuth } from '@/context/AuthContext';

const AIChat: React.FC = () => {
  const { user } = useAuth();
  
  return (
    <div className="h-full">
      <SidebarProvider>
        <SimpleChatContainer />
      </SidebarProvider>
    </div>
  );
};

export default memo(AIChat);
