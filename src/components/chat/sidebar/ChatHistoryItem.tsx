
import React, { useState } from 'react';
import { MessageSquare, MoreVertical } from 'lucide-react';
import { ChatHistoryItem as ChatHistoryItemType } from '@/hooks/chat/sidebar/types';
import { ContextMenu, ContextMenuTrigger } from "@/components/ui/context-menu";
import { SidebarMenuItem, SidebarMenuButton, SidebarMenuAction } from '@/components/ui/sidebar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import ChatHistoryContextMenu from './ChatHistoryContextMenu';

interface ChatHistoryItemProps {
  chat: ChatHistoryItemType;
  onSelect: (id: string, e?: React.MouseEvent) => void;
  onOpenRenameDialog: (chatId: string, currentTitle: string, e: React.MouseEvent) => void;
  onDelete: (chatId: string, e: React.MouseEvent) => void;
  onMoveToProject: (e: React.MouseEvent) => void;
  setActiveChatId: (id: string) => void;
}

const ChatHistoryItem: React.FC<ChatHistoryItemProps> = ({
  chat,
  onSelect,
  onOpenRenameDialog,
  onDelete,
  onMoveToProject,
  setActiveChatId
}) => {
  return (
    <ContextMenu>
      <ContextMenuTrigger className="w-full">
        <SidebarMenuItem>
          <SidebarMenuButton onClick={(e) => onSelect(chat.id.toString(), e)}>
            <MessageSquare className="h-4 w-4" />
            <div className="flex flex-col items-start">
              <span className="truncate max-w-[140px]">{chat.title}</span>
              <span className="text-xs text-muted-foreground">{chat.timestamp}</span>
            </div>
          </SidebarMenuButton>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <SidebarMenuAction 
                  className="opacity-0 group-hover/menu-item:opacity-100 transition-opacity" 
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveChatId(chat.id.toString());
                    
                    // Create a custom event to simulate a right-click
                    const contextMenuEvent = new MouseEvent('contextmenu', {
                      bubbles: true,
                      cancelable: true,
                      clientX: e.clientX,
                      clientY: e.clientY
                    });
                    
                    // Dispatch the event on the current target
                    e.currentTarget.dispatchEvent(contextMenuEvent);
                  }}
                >
                  <MoreVertical className="h-4 w-4" />
                </SidebarMenuAction>
              </TooltipTrigger>
              <TooltipContent>Options</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </SidebarMenuItem>
      </ContextMenuTrigger>

      <ChatHistoryContextMenu
        onRename={(e) => onOpenRenameDialog(chat.id.toString(), chat.title, e)}
        onMoveToProject={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setActiveChatId(chat.id.toString());
          onMoveToProject(e);
        }}
        onDelete={(e) => onDelete(chat.id.toString(), e)}
      />
    </ContextMenu>
  );
};

export default ChatHistoryItem;
