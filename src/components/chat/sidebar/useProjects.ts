
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Project } from './types';

export const useProjects = () => {
  const { toast } = useToast();
  
  // Project section state
  const [projectsOpen, setProjectsOpen] = useState(false);
  
  // Individual project states - all collapsed by default
  const [projectStates, setProjectStates] = useState<Record<string, boolean>>({
    "Honda Civic Issues": false,
    "Truck Maintenance": false,
    "DIY Repair Notes": false,
  });
  
  // New project dialog state
  const [newProjectDialogOpen, setNewProjectDialogOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  
  // User projects data
  const [userProjects, setUserProjects] = useState<Project[]>([
    { id: 1, title: "Honda Civic Issues", path: "#", subItems: [
      { id: 11, title: "Engine Check", path: "#" },
      { id: 12, title: "Transmission Issues", path: "#" },
    ]},
    { id: 2, title: "Truck Maintenance", path: "#", subItems: [
      { id: 21, title: "Oil Change Schedule", path: "#" },
      { id: 22, title: "Brake Inspection", path: "#" },
    ]},
    { id: 3, title: "DIY Repair Notes", path: "#", subItems: [
      { id: 31, title: "Air Filter Replacement", path: "#" },
      { id: 32, title: "Battery Guide", path: "#" },
    ]},
  ]);
  
  const toggleProject = (project: string) => {
    setProjectStates(prev => ({
      ...prev,
      [project]: !prev[project]
    }));
  };
  
  // Handle creating a new project
  const handleNewProjectButton = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the parent collapsible
    setNewProjectDialogOpen(true);
  };
  
  // Create new project handler
  const createNewProject = () => {
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
    projectStates,
    userProjects,
    newProjectDialogOpen,
    setNewProjectDialogOpen,
    newProjectName,
    setNewProjectName,
    toggleProject,
    handleNewProjectButton,
    createNewProject
  };
};
