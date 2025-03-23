import React from 'react';
import { ChevronDown, ChevronRight, FolderPlus, LogIn, Folder } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { SidebarGroup, SidebarGroupContent, SidebarMenu } from '@/components/ui/sidebar';
import SidebarProjectItem from './SidebarProjectItem';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Project } from '@/hooks/chat/sidebar/types';

interface ProjectSubItem {
  id: number | string;
  title: string;
  path: string;
}

interface Project {
  id: number | string;
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
  const { user } = useAuth();
  const navigate = useNavigate();

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
          {user && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-7 w-7 mr-2" 
              onClick={handleNewProjectButton}
            >
              <FolderPlus className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        <CollapsibleContent className="transition-all duration-200 ease-in-out">
          <SidebarGroupContent>
            {user ? (
              userProjects.length > 0 ? (
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
              ) : (
                <div className="p-3 text-center text-sm text-muted-foreground">
                  <Folder className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No projects yet</p>
                  <p className="text-xs mt-1">Click the + to create your first project</p>
                </div>
              )
            ) : (
              <div className="p-3 text-center">
                <div className="text-sm text-muted-foreground mb-3">
                  <LogIn className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Sign in to create and manage projects</p>
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
  );
};

export default SidebarProjects;
