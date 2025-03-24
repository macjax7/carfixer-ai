
import React from 'react';
import { ChevronDown, ChevronRight, MessageSquare, MoreVertical, Trash } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarMenuAction } from '@/components/ui/sidebar';
import { ChatHistoryItem } from '@/hooks/chat/sidebar/types';
import { Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { 
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuSeparator
} from '@/components/ui/context-menu';
import { supabase } from '@/integrations/supabase/client';

interface SidebarChatHistoryProps {
  chatHistory: ChatHistoryItem[];
  onSelectChat?: (chatId: string) => void;
  isLoading?: boolean;
  refreshChatHistory?: () => Promise<void>;
}

const SidebarChatHistory = ({ 
  chatHistory, 
  onSelectChat,
  isLoading = false,
  refreshChatHistory
}: SidebarChatHistoryProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [chatHistoryOpen, setChatHistoryOpen] = React.useState(chatHistory.length > 0);

  React.useEffect(() => {
    // If chat history changes and there are items, open the section
    if (chatHistory.length > 0) {
      setChatHistoryOpen(true);
    }
  }, [chatHistory]);

  const handleChatSelect = (id: string) => {
    try {
      if (!id) {
        throw new Error('Invalid chat ID');
      }
      
      if (onSelectChat) {
        onSelectChat(id);
      } else {
        navigate(`/chat/${id}`);
      }
    } catch (error) {
      console.error("Error selecting chat:", error);
      toast({
        title: "Error loading chat",
        description: "Failed to load the selected conversation. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteChat = async (chatId: string, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    try {
      // Delete the chat session from the database
      const { error } = await supabase
        .from('chat_sessions')
        .delete()
        .eq('id', chatId);

      if (error) {
        throw error;
      }

      // Show success toast
      toast({
        title: "Chat deleted",
        description: "The conversation has been removed from your history."
      });

      // Refresh the chat history
      if (refreshChatHistory) {
        await refreshChatHistory();
      }

      // If we're currently viewing this chat, navigate to the main chat page
      const currentPath = window.location.pathname;
      if (currentPath.includes(`/chat/${chatId}`)) {
        navigate('/chat');
      }
    } catch (error) {
      console.error("Error deleting chat:", error);
      toast({
        title: "Error deleting chat",
        description: "Failed to delete the conversation. Please try again.",
        variant: "destructive"
      });
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
                  <ContextMenu key={chat.id}>
                    <ContextMenuTrigger asChild>
                      <SidebarMenuItem>
                        <SidebarMenuButton onClick={() => handleChatSelect(chat.id.toString())}>
                          <MessageSquare className="h-4 w-4" />
                          <div className="flex flex-col items-start">
                            <span className="truncate max-w-[140px]">{chat.title}</span>
                            <span className="text-xs text-muted-foreground">{chat.timestamp}</span>
                          </div>
                        </SidebarMenuButton>
                        <SidebarMenuAction 
                          className="opacity-0 group-hover/menu-item:opacity-100 transition-opacity" 
                          onClick={(e) => {
                            e.stopPropagation();
                            // This just opens the context menu programmatically
                            // The actual menu appears via the ContextMenu component
                          }}
                        >
                          <MoreVertical className="h-4 w-4" />
                        </SidebarMenuAction>
                      </SidebarMenuItem>
                    </ContextMenuTrigger>
                    <ContextMenuContent className="w-56">
                      <ContextMenuItem 
                        className="text-destructive flex items-center gap-2 cursor-pointer"
                        onClick={(e) => handleDeleteChat(chat.id.toString(), e)}
                      >
                        <Trash className="h-4 w-4" />
                        <span>Delete chat</span>
                      </ContextMenuItem>
                      <ContextMenuSeparator />
                      <ContextMenuItem disabled className="flex items-center gap-2 cursor-pointer opacity-50">
                        <span>Add to folder</span>
                        <span className="text-xs ml-auto">(Coming soon)</span>
                      </ContextMenuItem>
                    </ContextMenuContent>
                  </ContextMenu>
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
