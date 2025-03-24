
import React, { useState } from 'react';
import { ChevronDown, ChevronRight, MoreVertical, Trash } from 'lucide-react';
import { Project } from '@/hooks/chat/sidebar/types';
import { 
  SidebarMenuItem, 
  SidebarMenuButton, 
  SidebarMenuAction, 
  SidebarMenu,
  SidebarGroup
} from '@/components/ui/sidebar';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SidebarProjectItemProps {
  project: Project;
  isOpen: boolean;
  onToggle: () => void;
  onDelete?: () => void;
  onSelectChat?: (chatId: string) => () => void;
}

const SidebarProjectItem: React.FC<SidebarProjectItemProps> = ({
  project,
  isOpen,
  onToggle,
  onDelete,
  onSelectChat
}) => {
  const [isHovering, setIsHovering] = useState(false);
  
  return (
    <ContextMenu>
      <ContextMenuTrigger className="w-full">
        <SidebarMenuItem
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          <SidebarMenuButton onClick={onToggle}>
            {isOpen ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
            <span className="truncate max-w-[140px]">{project.title}</span>
          </SidebarMenuButton>
          {onDelete && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <SidebarMenuAction
                    className={`${isHovering ? 'opacity-100' : 'opacity-0'} transition-opacity`}
                    onClick={(e) => {
                      e.stopPropagation();
                      
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
          )}
        </SidebarMenuItem>
      </ContextMenuTrigger>
      
      <ContextMenuContent className="w-56">
        <ContextMenuItem className="cursor-pointer" onClick={onToggle}>
          {isOpen ? "Collapse" : "Expand"}
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem 
          className="text-destructive cursor-pointer"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (onDelete) onDelete();
          }}
        >
          <Trash className="h-4 w-4 mr-2" />
          <span>Delete Project</span>
        </ContextMenuItem>
      </ContextMenuContent>
      
      {isOpen && project.subItems && project.subItems.length > 0 && (
        <SidebarGroup className="ml-4 mt-1">
          <SidebarMenu>
            {project.subItems.map((item) => (
              <SidebarMenuItem key={item.id.toString()}>
                <SidebarMenuButton 
                  asChild
                  onClick={onSelectChat ? onSelectChat(item.path.replace('/chat/', '')) : undefined}
                >
                  <div>
                    <span className="truncate max-w-[140px]">{item.title}</span>
                  </div>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      )}
    </ContextMenu>
  );
};

export default SidebarProjectItem;
