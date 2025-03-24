
import React from 'react';
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
} from "@/components/ui/popover";
import { Project } from '@/hooks/chat/sidebar/types';

interface ChatMoveToProjectPopoverProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projects: Project[];
  onSelectProject: (projectId: string) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

const ChatMoveToProjectPopover: React.FC<ChatMoveToProjectPopoverProps> = ({
  open,
  onOpenChange,
  projects,
  onSelectProject,
  onCancel,
  isSubmitting
}) => {
  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverContent className="w-60" align="center">
        <div className="space-y-2">
          <h3 className="font-medium">Move to project</h3>
          {projects.length === 0 ? (
            <p className="text-sm text-muted-foreground">No projects available. Create a project first.</p>
          ) : (
            <div className="max-h-48 overflow-y-auto space-y-1">
              {projects.map((project) => (
                <Button 
                  key={project.id.toString()} 
                  variant="ghost" 
                  className="w-full justify-start text-sm"
                  onClick={() => onSelectProject(project.id.toString())}
                  disabled={isSubmitting}
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
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default ChatMoveToProjectPopover;
