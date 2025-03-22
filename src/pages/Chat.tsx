
import React from 'react';
import Header from '../components/Header';
import AIChat from '../components/AIChat';
import ChatSidebar from '../components/chat/ChatSidebar';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';

const Chat: React.FC = () => {
  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Remove the header completely since we have the logo in the sidebar */}
      
      <SidebarProvider>
        <div className="flex flex-1 w-full overflow-hidden">
          <ChatSidebar />
          
          <main className="flex-1 overflow-hidden relative">
            {/* Add persistent SidebarTrigger visible on all screen sizes and in all sidebar states */}
            <div className="absolute top-4 left-4 z-20">
              <SidebarTrigger className="bg-background/80 backdrop-blur-sm rounded-md shadow-sm" />
            </div>
            <AIChat />
          </main>
        </div>
      </SidebarProvider>
    </div>
  );
};

export default Chat;
