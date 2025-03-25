
import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AIChat from '../components/AIChat';
import ChatSidebar from '../components/chat/ChatSidebar';
import { SidebarProvider, SidebarTrigger, useSidebar } from '@/components/ui/sidebar';
import { PlusCircle, Wrench } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import ProfileMenu from '@/components/ProfileMenu';
import { useChat } from '@/hooks/chat/useChat';

// Create a header component for the chat page
const ChatHeader = () => {
  const { state } = useSidebar();
  const { user } = useAuth();
  const { handleNewChat, isLoading } = useChat();
  const navigate = useNavigate();
  
  const onNewChatClick = () => {
    console.log("New Chat button clicked - attempting to create new chat");
    // Call handleNewChat without any conditions
    handleNewChat();
  };
  
  // Only show these UI elements when the sidebar is collapsed
  if (state === 'collapsed') {
    return (
      <div className="absolute top-0 left-0 right-0 z-10 px-2 py-3 flex items-center justify-between bg-background/80 backdrop-blur-sm">
        <div className="flex items-center transition-all duration-200 ml-2">
          {user && <SidebarTrigger className="bg-background/80 backdrop-blur-sm rounded-md shadow-sm mr-2" />}
          
          {user && (
            <button 
              className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-md border border-border/60 hover:bg-secondary transition-colors mr-3 cursor-pointer"
              onClick={onNewChatClick}
            >
              <PlusCircle className="h-4 w-4" />
              <span>{isLoading ? "Creating..." : "New Chat"}</span>
            </button>
          )}
          
          <div className="flex items-center gap-2">
            <div className="rounded-md bg-carfix-600 p-1">
              <Wrench className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-lg font-semibold hidden sm:block">CarFix AI</h1>
          </div>
        </div>
        
        <div className="mr-4">
          {user ? (
            <ProfileMenu />
          ) : (
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/login', { state: { preserveSession: true } })}
              >
                Log in
              </Button>
              <Button 
                variant="default" 
                size="sm"
                onClick={() => navigate('/signup', { state: { preserveSession: true } })}
              >
                Sign up
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }
  
  // When sidebar is expanded, show the CarFix AI logo and auth buttons
  return (
    <div className="absolute top-0 left-0 right-0 z-10 px-2 py-3 flex items-center justify-between bg-background/80 backdrop-blur-sm">
      <div className="flex items-center ml-4">
        <div className="flex items-center gap-2">
          <div className="rounded-md bg-carfix-600 p-1">
            <Wrench className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-lg font-semibold hidden sm:block">CarFix AI</h1>
        </div>
      </div>
      
      <div className="mr-4">
        {user ? (
          <ProfileMenu />
        ) : (
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate('/login', { state: { preserveSession: true } })}
            >
              Log in
            </Button>
            <Button 
              variant="default" 
              size="sm" 
              onClick={() => navigate('/signup', { state: { preserveSession: true } })}
            >
              Sign up
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

const Chat: React.FC = () => {
  const { user } = useAuth();
  const params = useParams();
  const { loadChatById } = useChat();
  
  // Load specific chat if chatId is in the URL
  useEffect(() => {
    if (user && params.chatId) {
      loadChatById(params.chatId);
    }
  }, [user, params.chatId, loadChatById]);

  // For guest users, render a simplified layout without the sidebar
  if (!user) {
    return (
      <div className="flex flex-col h-screen bg-background">
        <SidebarProvider defaultOpen={false}>
          <div className="flex flex-1 w-full overflow-hidden">
            <main className="flex-1 overflow-hidden relative">
              <ChatHeader />
              <AIChat />
            </main>
          </div>
        </SidebarProvider>
      </div>
    );
  }

  // For authenticated users, show the full layout with sidebar
  return (
    <div className="flex flex-col h-screen bg-background">
      <SidebarProvider defaultOpen={false}>
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
