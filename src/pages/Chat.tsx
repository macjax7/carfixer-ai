
import React from 'react';
import Header from '../components/Header';
import AIChat from '../components/AIChat';
import ChatSidebar from '../components/chat/ChatSidebar';
import { SidebarProvider } from '@/components/ui/sidebar';

const Chat: React.FC = () => {
  return (
    <div className="flex flex-col h-screen bg-background">
      <Header title="CarFix AI" showBackButton={false} showMenu={false} showNotifications={false} />
      
      <SidebarProvider>
        <div className="flex flex-1 w-full overflow-hidden">
          <ChatSidebar />
          
          <main className="flex-1 overflow-hidden">
            <AIChat />
          </main>
        </div>
      </SidebarProvider>
    </div>
  );
};

export default Chat;
