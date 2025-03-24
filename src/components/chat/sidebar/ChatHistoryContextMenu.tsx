
import React from 'react';
import { Pencil, FolderCode, Trash } from 'lucide-react';
import {
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
} from "@/components/ui/context-menu";

interface ChatHistoryContextMenuProps {
  onRename: (e: React.MouseEvent) => void;
  onMoveToProject: (e: React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent) => void;
}

const ChatHistoryContextMenu: React.FC<ChatHistoryContextMenuProps> = ({
  onRename,
  onMoveToProject,
  onDelete
}) => {
  return (
    <ContextMenuContent className="w-56">
      <ContextMenuItem 
        className="flex items-center gap-2 cursor-pointer"
        onClick={onRename}
      >
        <Pencil className="h-4 w-4" />
        <span>Rename</span>
      </ContextMenuItem>
      
      <ContextMenuItem 
        className="flex items-center gap-2 cursor-pointer"
        onClick={onMoveToProject}
      >
        <FolderCode className="h-4 w-4" />
        <span>Move to project</span>
      </ContextMenuItem>

      <ContextMenuSeparator />
      
      <ContextMenuItem 
        className="text-destructive flex items-center gap-2 cursor-pointer"
        onClick={onDelete}
      >
        <Trash className="h-4 w-4" />
        <span>Delete chat</span>
      </ContextMenuItem>
    </ContextMenuContent>
  );
};

export default ChatHistoryContextMenu;
