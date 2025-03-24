
import React, { useState } from 'react';
import { ChevronDown, ChevronRight, MessageSquare, MoreVertical, Trash, Pencil, FolderMove } from 'lucide-react';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useProjects } from '@/hooks/chat/sidebar/useProjects';

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
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [moveToProjectOpen, setMoveToProjectOpen] = useState(false);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const { userProjects, fetchProjects } = useProjects();
  
  React.useEffect(() => {
    // If chat history changes and there are items, open the section
    if (chatHistory.length > 0) {
      setChatHistoryOpen(true);
    }
  }, [chatHistory]);

  React.useEffect(() => {
    // Fetch projects when component mounts
    fetchProjects();
  }, [fetchProjects]);

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

  const handleRenameChat = async () => {
    if (!activeChatId || !newTitle.trim()) return;

    try {
      const { error } = await supabase
        .from('chat_sessions')
        .update({ title: newTitle })
        .eq('id', activeChatId);

      if (error) {
        throw error;
      }

      toast({
        title: "Chat renamed",
        description: "The conversation has been renamed successfully."
      });

      if (refreshChatHistory) {
        await refreshChatHistory();
      }

      // Close dialog
      setRenameDialogOpen(false);
    } catch (error) {
      console.error("Error renaming chat:", error);
      toast({
        title: "Error renaming chat",
        description: "Failed to rename the conversation. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleOpenRenameDialog = (chatId: string, currentTitle: string, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setActiveChatId(chatId);
    setNewTitle(currentTitle);
    setRenameDialogOpen(true);
  };

  const handleMoveToProject = async (projectId: string) => {
    if (!activeChatId) return;

    try {
      // Insert chat session as a project item
      const { error } = await supabase
        .from('project_items')
        .insert({
          project_id: projectId,
          title: chatHistory.find(chat => chat.id.toString() === activeChatId)?.title || 'Untitled Chat',
          path: `/chat/${activeChatId}`
        });

      if (error) {
        throw error;
      }

      toast({
        title: "Chat moved to project",
        description: "The conversation has been added to the selected project."
      });

      // Close popover
      setMoveToProjectOpen(false);
    } catch (error) {
      console.error("Error moving chat to project:", error);
      toast({
        title: "Error moving chat",
        description: "Failed to move the conversation to the project. Please try again.",
        variant: "destructive"
      });
    }
  };

  const openContextMenu = (chatId: string, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setActiveChatId(chatId);
    
    // Find the corresponding context menu and open it
    const menuEl = document.getElementById(`context-menu-${chatId}`);
    if (menuEl) {
      menuEl.click();
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
                      <div id={`context-menu-${chat.id.toString()}`} className="hidden">
                        {/* Hidden trigger element for programmatic activation */}
                      </div>
                    </ContextMenuTrigger>

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
                        onClick={(e) => openContextMenu(chat.id.toString(), e)}
                      >
                        <MoreVertical className="h-4 w-4" />
                      </SidebarMenuAction>
                    </SidebarMenuItem>

                    <ContextMenuContent className="w-56">
                      <ContextMenuItem 
                        className="flex items-center gap-2 cursor-pointer"
                        onClick={(e) => handleOpenRenameDialog(chat.id.toString(), chat.title, e)}
                      >
                        <Pencil className="h-4 w-4" />
                        <span>Rename</span>
                      </ContextMenuItem>
                      
                      <ContextMenuItem 
                        className="flex items-center gap-2 cursor-pointer"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setActiveChatId(chat.id.toString());
                          setMoveToProjectOpen(true);
                        }}
                      >
                        <FolderMove className="h-4 w-4" />
                        <span>Move to project</span>
                      </ContextMenuItem>

                      <ContextMenuSeparator />
                      
                      <ContextMenuItem 
                        className="text-destructive flex items-center gap-2 cursor-pointer"
                        onClick={(e) => handleDeleteChat(chat.id.toString(), e)}
                      >
                        <Trash className="h-4 w-4" />
                        <span>Delete chat</span>
                      </ContextMenuItem>
                    </ContextMenuContent>
                  </ContextMenu>
                ))}
              </SidebarMenu>
            )}
          </SidebarGroupContent>
        </CollapsibleContent>
      </Collapsible>

      {/* Rename Dialog */}
      <Dialog open={renameDialogOpen} onOpenChange={setRenameDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Rename Chat</DialogTitle>
            <DialogDescription>
              Enter a new name for this conversation.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input 
              value={newTitle} 
              onChange={(e) => setNewTitle(e.target.value)} 
              placeholder="Chat name" 
              className="w-full"
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleRenameChat}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Move to Project Popover */}
      <Popover open={moveToProjectOpen} onOpenChange={setMoveToProjectOpen}>
        <PopoverContent className="w-60" align="center">
          <div className="space-y-2">
            <h3 className="font-medium">Move to project</h3>
            {userProjects.length === 0 ? (
              <p className="text-sm text-muted-foreground">No projects available. Create a project first.</p>
            ) : (
              <div className="max-h-48 overflow-y-auto space-y-1">
                {userProjects.map((project) => (
                  <Button 
                    key={project.id.toString()} 
                    variant="ghost" 
                    className="w-full justify-start text-sm"
                    onClick={() => handleMoveToProject(project.id.toString())}
                  >
                    {project.title}
                  </Button>
                ))}
              </div>
            )}
            <div className="pt-2 flex justify-end">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setMoveToProjectOpen(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </SidebarGroup>
  );
};

export default SidebarChatHistory;
