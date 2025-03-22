
import React from 'react';
import AIChat from '../components/AIChat';
import ChatSidebar from '../components/chat/ChatSidebar';
import { SidebarProvider, SidebarTrigger, useSidebar } from '@/components/ui/sidebar';
import { PlusCircle, Wrench } from 'lucide-react';
import { Link } from 'react-router-dom';

// Create a header component for the chat page
const ChatHeader = () => {
  const { state } = useSidebar();
  
  return (
    <div className="absolute top-0 left-0 right-0 z-10 px-2 py-3 flex items-center bg-background/80 backdrop-blur-sm">
      <div className={`flex items-center transition-all duration-200 ${state === 'expanded' ? 'ml-0' : 'ml-2'}`}>
        <SidebarTrigger className="bg-background/80 backdrop-blur-sm rounded-md shadow-sm mr-2" />
        
        <button 
          className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-md border border-border/60 hover:bg-secondary transition-colors mr-3"
        >
          <PlusCircle className="h-4 w-4" />
          <span>New Chat</span>
        </button>
        
        <Link to="/" className="flex items-center gap-2">
          <div className="rounded-md bg-carfix-600 p-1">
            <Wrench className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-lg font-semibold hidden sm:block">CarFix AI</h1>
        </Link>
      </div>
    </div>
  );
};

const Chat: React.FC = () => {
  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Remove the header completely since we have the logo in the sidebar */}
      
      <SidebarProvider>
        <div className="flex flex-1 w-full overflow-hidden">
          <ChatSidebar />
          
          <main className="flex-1 overflow-hidden relative">
            <ChatHeader />
            <AIChat />
          </main>
        </div>
      </SidebarProvider>
    </div>
  );
};

export default Chat;
