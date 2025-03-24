
import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { SidebarGroup, SidebarGroupContent, SidebarMenu } from '@/components/ui/sidebar';
import { ChatHistoryItem as ChatHistoryItemType } from '@/hooks/chat/sidebar/types';
import { useProjects } from '@/hooks/chat/sidebar/useProjects';
import { useChatHistoryActions } from '@/hooks/chat/sidebar/useChatHistoryActions';

// Import the new components
import ChatHistoryItem from './ChatHistoryItem';
import ChatHistoryLoading from './ChatHistoryLoading';
import ChatRenameDialog from './ChatRenameDialog';
import ChatMoveToProjectPopover from './ChatMoveToProjectPopover';

interface SidebarChatHistoryProps {
  chatHistory: ChatHistoryItemType[];
  onSelectChat?: (chatId: string, e?: React.MouseEvent) => void;
  isLoading?: boolean;
  refreshChatHistory?: () => Promise<void>;
}

const SidebarChatHistory: React.FC<SidebarChatHistoryProps> = ({ 
  chatHistory, 
  onSelectChat,
  isLoading = false,
  refreshChatHistory
}: SidebarChatHistoryProps) => {
  const [chatHistoryOpen, setChatHistoryOpen] = useState(chatHistory.length > 0);
  const { userProjects, fetchProjects } = useProjects();
  
  // Use the new hook for chat actions
  const {
    renameDialogOpen,
    setRenameDialogOpen,
    moveToProjectOpen,
    setMoveToProjectOpen,
    activeChatId,
    setActiveChatId,
    newTitle,
    setNewTitle,
    isSubmitting,
    handleChatSelect,
    handleDeleteChat,
    handleRenameChat,
    handleOpenRenameDialog,
    handleMoveToProject
  } = useChatHistoryActions(chatHistory, refreshChatHistory);

  // Automatically open chat history when there are items
  useEffect(() => {
    if (chatHistory.length > 0) {
      setChatHistoryOpen(true);
    }
  }, [chatHistory]);

  // Fetch projects for the move to project functionality
  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // Use the provided onSelectChat function if available, otherwise use the local one
  const selectChat = onSelectChat || handleChatSelect;

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
              <ChatHistoryLoading />
            ) : (
              <SidebarMenu>
                {chatHistory.map((chat) => (
                  <ChatHistoryItem
                    key={chat.id.toString()}
                    chat={chat}
                    onSelect={selectChat}
                    onOpenRenameDialog={handleOpenRenameDialog}
                    onDelete={handleDeleteChat}
                    onMoveToProject={() => setMoveToProjectOpen(true)}
                    setActiveChatId={setActiveChatId}
                  />
                ))}
              </SidebarMenu>
            )}
          </SidebarGroupContent>
        </CollapsibleContent>
      </Collapsible>

      {/* Rename Dialog */}
      <ChatRenameDialog
        open={renameDialogOpen}
        onOpenChange={setRenameDialogOpen}
        title={newTitle}
        onTitleChange={(e) => setNewTitle(e.target.value)}
        onSave={handleRenameChat}
        onCancel={() => {
          setRenameDialogOpen(false);
          setActiveChatId(null);
          setNewTitle("");
        }}
        isSubmitting={isSubmitting}
      />

      {/* Move to Project Popover */}
      <ChatMoveToProjectPopover
        open={moveToProjectOpen}
        onOpenChange={setMoveToProjectOpen}
        projects={userProjects}
        onSelectProject={handleMoveToProject}
        onCancel={() => {
          setMoveToProjectOpen(false);
          setActiveChatId(null);
        }}
        isSubmitting={isSubmitting}
      />
    </SidebarGroup>
  );
};

export default SidebarChatHistory;
