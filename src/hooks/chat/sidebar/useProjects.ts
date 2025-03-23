
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Project, ProjectState } from './types';

export const useProjects = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Initialize projectsOpen based on whether user is authenticated
  const [projectsOpen, setProjectsOpen] = useState(!!user);
  const [userProjects, setUserProjects] = useState<Project[]>([]);
  const [projectStates, setProjectStates] = useState<ProjectState>({});
  
  // New project dialog state
  const [newProjectDialogOpen, setNewProjectDialogOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  
  // Close projects section when there are no projects
  useEffect(() => {
    if (userProjects.length === 0) {
      setProjectsOpen(false);
    }
  }, [userProjects]);
  
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
    
    // Open the projects section when a new project is added
    setProjectsOpen(true);
    
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
