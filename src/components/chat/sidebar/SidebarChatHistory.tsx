
import React from 'react';
import { ChevronDown, ChevronRight, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';
import { ChatHistoryItem } from '@/hooks/chat/sidebar/types';
import { Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SidebarChatHistoryProps {
  chatHistory: ChatHistoryItem[];
  onSelectChat?: (chatId: string) => void;
  isLoading?: boolean;
}

const SidebarChatHistory = ({ 
  chatHistory, 
  onSelectChat,
  isLoading = false
}: SidebarChatHistoryProps) => {
  const navigate = useNavigate();
  const [chatHistoryOpen, setChatHistoryOpen] = React.useState(chatHistory.length > 0);

  React.useEffect(() => {
    // If chat history changes and there are items, open the section
    if (chatHistory.length > 0) {
      setChatHistoryOpen(true);
    }
  }, [chatHistory]);

  const handleChatSelect = (id: string) => {
    if (onSelectChat) {
      onSelectChat(id);
    } else {
      navigate(`/chat/${id}`);
    }
  };

  // Only show the chat history section if there are chats or loading
  if (chatHistory.length === 0 && !isLoading) return null;

  return (
    <SidebarGroup className="mt-4 pt-2 border-t border-border">
      <Collapsible
        open={chatHistoryOpen}
        onOpenChange={setChatHistoryOpen}
        className="w-full"
      >
        <CollapsibleTrigger asChild>
          <button className="flex items-center w-full p-2 text-sm font-medium hover:bg-sidebar-accent rounded-md transition-colors">
            <span className="flex-1 flex items-center">
              {chatHistoryOpen ? 
                <ChevronDown className="h-4 w-4 mr-2 text-muted-foreground" /> : 
                <ChevronRight className="h-4 w-4 mr-2 text-muted-foreground" />}
              Recent Chats
            </span>
          </button>
        </CollapsibleTrigger>
        
        <CollapsibleContent className="transition-all duration-200 ease-in-out">
          <SidebarGroupContent>
            {isLoading ? (
              <div className="p-3 text-center">
                <Loader2 className="h-6 w-6 mx-auto mb-2 animate-spin opacity-50" />
                <p className="text-sm text-muted-foreground">Loading chats...</p>
              </div>
            ) : (
              <SidebarMenu>
                {chatHistory.map((chat) => (
                  <SidebarMenuItem key={chat.id}>
                    <SidebarMenuButton onClick={() => handleChatSelect(chat.id)}>
                      <MessageSquare className="h-4 w-4" />
                      <div className="flex flex-col items-start">
                        <span className="truncate max-w-[140px]">{chat.title}</span>
                        <span className="text-xs text-muted-foreground">{chat.timestamp}</span>
                      </div>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            )}
          </SidebarGroupContent>
        </CollapsibleContent>
      </Collapsible>
    </SidebarGroup>
  );
};

export default SidebarChatHistory;
