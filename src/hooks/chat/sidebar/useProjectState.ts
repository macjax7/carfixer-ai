
import { useState } from 'react';
import { Project, ProjectState } from './types';

export const useProjectState = () => {
  // Initialize projectsOpen to false (closed by default)
  const [projectsOpen, setProjectsOpen] = useState(false);
  const [userProjects, setUserProjects] = useState<Project[]>([]);
  const [projectStates, setProjectStates] = useState<ProjectState>({});
  const [isLoading, setIsLoading] = useState(false);
  
  // New project dialog state
  const [newProjectDialogOpen, setNewProjectDialogOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');

  // Toggle project expansion state
  const toggleProject = (project: string) => {
    setProjectStates(prev => ({
      ...prev,
      [project]: !prev[project]
    }));
  };

  return {
    projectsOpen,
    setProjectsOpen,
    userProjects,
    setUserProjects,
    projectStates,
    setProjectStates,
    isLoading,
    setIsLoading,
    newProjectDialogOpen,
    setNewProjectDialogOpen,
    newProjectName,
    setNewProjectName,
    toggleProject
  };
};
