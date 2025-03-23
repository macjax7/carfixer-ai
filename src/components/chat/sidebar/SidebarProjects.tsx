
import React from 'react';
import { ChevronDown, ChevronRight, FolderPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { SidebarGroup, SidebarGroupContent, SidebarMenu } from '@/components/ui/sidebar';
import SidebarProjectItem from './SidebarProjectItem';

interface ProjectSubItem {
  id: number;
  title: string;
  path: string;
}

interface Project {
  id: number;
  title: string;
  path: string;
  subItems: ProjectSubItem[];
}

interface SidebarProjectsProps {
  projectsOpen: boolean;
  setProjectsOpen: (open: boolean) => void;
  userProjects: Project[];
  projectStates: Record<string, boolean>;
  toggleProject: (project: string) => void;
  handleNewProjectButton: (e: React.MouseEvent) => void;
}

const SidebarProjects = ({
  projectsOpen,
  setProjectsOpen,
  userProjects,
  projectStates,
  toggleProject,
  handleNewProjectButton
}: SidebarProjectsProps) => {
  return (
    <SidebarGroup className="mt-4 pt-2 border-t border-border">
      <Collapsible
        open={projectsOpen}
        onOpenChange={setProjectsOpen}
        className="w-full"
      >
        <div className="flex items-center">
          <CollapsibleTrigger asChild>
            <button className="flex items-center flex-grow p-2 text-sm font-medium hover:bg-sidebar-accent rounded-md transition-colors">
              <span className="flex-1 flex items-center">
                {projectsOpen ? 
                  <ChevronDown className="h-4 w-4 mr-2 text-muted-foreground" /> : 
                  <ChevronRight className="h-4 w-4 mr-2 text-muted-foreground" />}
                Projects
              </span>
            </button>
          </CollapsibleTrigger>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-7 w-7 mr-2" 
            onClick={handleNewProjectButton}
          >
            <FolderPlus className="h-4 w-4" />
          </Button>
        </div>
        
        <CollapsibleContent className="transition-all duration-200 ease-in-out">
          <SidebarGroupContent>
            <SidebarMenu>
              {userProjects.map((project) => (
                <SidebarProjectItem 
                  key={project.id}
                  project={project}
                  isOpen={projectStates[project.title]}
                  onToggle={() => toggleProject(project.title)}
                />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </CollapsibleContent>
      </Collapsible>
    </SidebarGroup>
  );
};

export default SidebarProjects;
