import React from 'react';
import { ChevronDown, ChevronRight, FolderPlus, LogIn, Folder, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { SidebarGroup, SidebarGroupContent, SidebarMenu } from '@/components/ui/sidebar';
import SidebarProjectItem from './SidebarProjectItem';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Project, ProjectState } from '@/hooks/chat/sidebar/types';

interface SidebarProjectsProps {
  projectsOpen: boolean;
  setProjectsOpen: (value: boolean) => void;
  userProjects: Project[];
  projectStates: ProjectState;
  toggleProject: (projectId: string) => void;
  handleNewProjectButton: () => void;
  isLoading?: boolean;
  deleteProject?: (projectId: string) => Promise<void>;
  onSelectChat?: (chatId: string) => void;
  refreshProjects?: () => Promise<void>;
}

const SidebarProjects = ({
  projectsOpen,
  setProjectsOpen,
  userProjects,
  projectStates,
  toggleProject,
  handleNewProjectButton,
  isLoading = false,
  deleteProject,
  onSelectChat,
  refreshProjects
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
              isLoading ? (
                <div className="p-3 text-center">
                  <Loader2 className="h-6 w-6 mx-auto mb-2 animate-spin opacity-50" />
                  <p className="text-sm text-muted-foreground">Loading projects...</p>
                </div>
              ) : userProjects.length > 0 ? (
                <SidebarMenu>
                  {userProjects.map((project) => (
                    <SidebarProjectItem 
                      key={project.id}
                      project={project}
                      isOpen={projectStates[project.title]}
                      onToggle={() => toggleProject(project.title)}
                      onDelete={deleteProject ? () => deleteProject(project.id.toString()) : undefined}
                      onSelectChat={onSelectChat}
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
