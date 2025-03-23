
import React from 'react';
import { Link } from 'react-router-dom';
import { Folder, ChevronDown, ChevronRight } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';

interface ProjectSubItem {
  id: number;
  title: string;
  path: string;
}

interface SidebarProjectItemProps {
  project: {
    id: number;
    title: string;
    path: string;
    subItems: ProjectSubItem[];
  };
  isOpen: boolean;
  onToggle: () => void;
}

const SidebarProjectItem = ({ project, isOpen, onToggle }: SidebarProjectItemProps) => {
  return (
    <div>
      <Collapsible 
        open={isOpen} 
        onOpenChange={onToggle}
      >
        <CollapsibleTrigger asChild>
          <SidebarMenuButton className="flex items-center justify-between w-full">
            <div className="flex items-center">
              <Folder className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>{project.title}</span>
            </div>
            {isOpen ? 
              <ChevronDown className="h-3 w-3 text-muted-foreground ml-1" /> : 
              <ChevronRight className="h-3 w-3 text-muted-foreground ml-1" />}
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent className="pl-6 transition-all duration-200 ease-in-out">
          {project.subItems.map((subItem) => (
            <SidebarMenuItem key={subItem.id}>
              <SidebarMenuButton asChild className="text-sm">
                <Link to={subItem.path}>
                  <span>{subItem.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default SidebarProjectItem;
