
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronRight, Clock, MessageSquare, LogIn, Loader2, MoreVertical, FolderInput, Trash2, Pencil, Archive } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';
import { ChatHistoryItem } from '@/hooks/chat/sidebar/types';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { 
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger 
} from '@/components/ui/context-menu';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

interface SidebarChatHistoryProps {
  chatHistoryOpen: boolean;
  setChatHistoryOpen: (open: boolean) => void;
  chatHistory: ChatHistoryItem[];
  isLoading?: boolean;
  onSelectChat: (chatId: string) => void;
  refreshChatHistory: () => Promise<void>;
}

const SidebarChatHistory = ({
  chatHistoryOpen,
  setChatHistoryOpen,
  chatHistory,
  isLoading = false,
  onSelectChat,
  refreshChatHistory
}: SidebarChatHistoryProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isRenaming, setIsRenaming] = React.useState(false);
  const [chatToRename, setChatToRename] = React.useState<{id: string, title: string} | null>(null);
  const [newChatTitle, setNewChatTitle] = React.useState('');
  
  // Dialog to confirm deletion
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [chatToDelete, setChatToDelete] = React.useState<string | null>(null);

  const handleChatClick = (e: React.MouseEvent, chatId: string) => {
    e.preventDefault();
    onSelectChat(chatId);
    navigate(`/chat/${chatId}`);
  };

  const handleDeleteChat = async (chatId: string) => {
    if (!user) return;
    
    try {
      // Delete the chat session
      const { error } = await supabase
        .from('chat_sessions')
        .delete()
        .eq('id', chatId)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      toast({
        title: "Chat deleted",
        description: "The chat has been removed from your history",
      });
      
      // Refresh the chat history
      await refreshChatHistory();
      
      // Navigate to the main chat page if needed
      if (window.location.pathname.includes(chatId)) {
        navigate('/chat');
      }
    } catch (error) {
      console.error('Error deleting chat:', error);
      toast({
        title: "Error",
        description: "Failed to delete the chat",
        variant: "destructive"
      });
    }
  };

  const handleRenameChat = async () => {
    if (!user || !chatToRename) return;
    
    try {
      const { error } = await supabase
        .from('chat_sessions')
        .update({ title: newChatTitle })
        .eq('id', chatToRename.id)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      toast({
        title: "Chat renamed",
        description: "Your chat has been renamed successfully",
      });
      
      // Refresh the chat history
      await refreshChatHistory();
      setIsRenaming(false);
    } catch (error) {
      console.error('Error renaming chat:', error);
      toast({
        title: "Error",
        description: "Failed to rename the chat",
        variant: "destructive"
      });
    }
  };

  const handleMoveToProject = (chatId: string) => {
    toast({
      title: "Coming soon",
      description: "Moving chats to projects will be available soon",
    });
  };

  return (
    <>
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
                Chat History
              </span>
              {isLoading && <Loader2 className="h-3 w-3 animate-spin mr-2" />}
            </button>
          </CollapsibleTrigger>
          
          <CollapsibleContent className="transition-all duration-200 ease-in-out">
            <SidebarGroupContent>
              {user ? (
                chatHistory.length > 0 ? (
                  <SidebarMenu>
                    {chatHistory.map((chat) => (
                      <ContextMenu key={chat.id}>
                        <ContextMenuTrigger>
                          <SidebarMenuItem className="group">
                            <SidebarMenuButton 
                              asChild 
                              className="block w-full px-2 py-2 relative group"
                            >
                              <div 
                                className="w-full cursor-pointer"
                                onClick={(e) => handleChatClick(e, chat.id.toString())}
                              >
                                <div className="flex flex-col w-full">
                                  <span className="text-base font-normal truncate text-sidebar-foreground">{chat.title}</span>
                                  <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                    <Clock className="h-3 w-3 flex-shrink-0" />
                                    <span className="truncate">{chat.timestamp}</span>
                                  </div>
                                </div>
                              </div>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        </ContextMenuTrigger>
                        <ContextMenuContent className="w-64">
                          <ContextMenuItem 
                            className="flex items-center cursor-pointer"
                            onClick={() => handleMoveToProject(chat.id.toString())}
                          >
                            <FolderInput className="mr-2 h-4 w-4" />
                            <span>Move to project</span>
                          </ContextMenuItem>
                          <ContextMenuItem 
                            className="flex items-center cursor-pointer"
                            onClick={() => {
                              setChatToRename({ id: chat.id.toString(), title: chat.title });
                              setNewChatTitle(chat.title);
                              setIsRenaming(true);
                            }}
                          >
                            <Pencil className="mr-2 h-4 w-4" />
                            <span>Rename</span>
                          </ContextMenuItem>
                          <ContextMenuItem className="flex items-center cursor-pointer">
                            <Archive className="mr-2 h-4 w-4" />
                            <span>Archive</span>
                          </ContextMenuItem>
                          <ContextMenuSeparator />
                          <ContextMenuItem 
                            className="flex items-center cursor-pointer text-destructive focus:text-destructive"
                            onClick={() => {
                              setChatToDelete(chat.id.toString());
                              setDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            <span>Delete</span>
                          </ContextMenuItem>
                        </ContextMenuContent>
                      </ContextMenu>
                    ))}
                  </SidebarMenu>
                ) : (
                  <div className="p-3 text-center text-sm text-muted-foreground">
                    <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No chat history yet</p>
                    <p className="text-xs mt-1">Start a new conversation to see it here</p>
                  </div>
                )
              ) : (
                <div className="p-3 text-center">
                  <div className="text-sm text-muted-foreground mb-3">
                    <LogIn className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>Sign in to view and save your chat history</p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => navigate('/login')}
                    className="w-full"
                  >
                    Sign in
                  </Button>
                </div>
              )}
            </SidebarGroupContent>
          </CollapsibleContent>
        </Collapsible>
      </SidebarGroup>

      {/* Rename Dialog */}
      <Dialog open={isRenaming} onOpenChange={setIsRenaming}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Rename chat</DialogTitle>
            <DialogDescription>
              Change the name of this chat conversation
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center space-y-2">
            <Input
              value={newChatTitle}
              onChange={(e) => setNewChatTitle(e.target.value)}
              placeholder="Enter new name"
              className="w-full"
            />
          </div>
          <DialogFooter className="sm:justify-end">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsRenaming(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleRenameChat}
              disabled={!newChatTitle.trim()}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete chat</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this chat? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-end">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setDeleteDialogOpen(false);
                setChatToDelete(null);
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => {
                if (chatToDelete) {
                  handleDeleteChat(chatToDelete);
                  setDeleteDialogOpen(false);
                  setChatToDelete(null);
                }
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SidebarChatHistory;
