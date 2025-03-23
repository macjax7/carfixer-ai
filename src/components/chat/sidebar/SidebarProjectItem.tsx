
import React from 'react';
import { ChevronDown, ChevronRight, Trash2 } from 'lucide-react';
import { SidebarMenuItem, SidebarMenuSub } from '@/components/ui/sidebar';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Project } from '@/hooks/chat/sidebar/types';

interface SidebarProjectItemProps {
  project: Project;
  isOpen: boolean;
  onToggle: () => void;
  onDelete?: () => void;
}

const SidebarProjectItem = ({ project, isOpen, onToggle, onDelete }: SidebarProjectItemProps) => {
  const hasSubItems = project.subItems && project.subItems.length > 0;
  
  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (onDelete) {
      onDelete();
    }
  };
  
  return (
    <div>
      <SidebarMenuItem
        onClick={hasSubItems ? onToggle : undefined}
        className={`flex items-center justify-between group ${hasSubItems ? 'cursor-pointer' : ''}`}
      >
        <Link 
          to={project.path} 
          className="flex-1 flex items-center"
          onClick={e => hasSubItems && e.preventDefault()}
        >
          {hasSubItems ? (
            isOpen ? 
              <ChevronDown className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" /> : 
              <ChevronRight className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
          ) : (
            <span className="w-5" />
          )}
          <span className="truncate">{project.title}</span>
        </Link>
        
        {onDelete && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={handleDeleteClick}
          >
            <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
          </Button>
        )}
      </SidebarMenuItem>
      
      {hasSubItems && isOpen && (
        <SidebarMenuSub>
          {project.subItems.map((item) => (
            <SidebarMenuItem key={item.id} className="pl-7">
              <Link to={item.path} className="truncate">
                {item.title}
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenuSub>
      )}
    </div>
  );
};

export default SidebarProjectItem;
