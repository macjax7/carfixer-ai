
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/context/AuthContext';
import { Project, ProjectState } from './types';

export const useProjects = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [projectsOpen, setProjectsOpen] = useState(true);
  const [userProjects, setUserProjects] = useState<Project[]>([]);
  const [projectStates, setProjectStates] = useState<ProjectState>({});
  const [newProjectDialogOpen, setNewProjectDialogOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');

  // Toggle project expansion
  const toggleProject = (project: string) => {
    setProjectStates(prev => ({
      ...prev,
      [project]: !prev[project]
    }));
  };

  // Handle creating a new project
  const handleNewProjectButton = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the parent collapsible
    
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to create projects",
        variant: "destructive"
      });
      return;
    }
    
    setNewProjectDialogOpen(true);
  };

  // Create new project handler
  const createNewProject = () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to create projects",
        variant: "destructive"
      });
      return;
    }
    
    if (!newProjectName.trim()) {
      toast({
        title: "Error",
        description: "Project name cannot be empty",
        variant: "destructive"
      });
      return;
    }
    
    const newProject: Project = {
      id: Date.now(),
      title: newProjectName,
      path: "#",
      subItems: []
    };
    
    setUserProjects(prev => [...prev, newProject]);
    
    // Update project states to include the new project
    setProjectStates(prev => ({
      ...prev,
      [newProjectName]: false
    }));
    
    setNewProjectName('');
    setNewProjectDialogOpen(false);
    
    toast({
      title: "Success",
      description: `Project "${newProjectName}" created successfully`,
    });
  };

  return {
    projectsOpen,
    setProjectsOpen,
    userProjects,
    setUserProjects,
    projectStates,
    setProjectStates,
    newProjectDialogOpen,
    setNewProjectDialogOpen,
    newProjectName,
    setNewProjectName,
    toggleProject,
    handleNewProjectButton,
    createNewProject
  };
};
