
import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useProjectState } from './useProjectState';
import { useProjectFetching } from './useProjectFetching';
import { useProjectMutations } from './useProjectMutations';

export const useProjects = () => {
  const { user } = useAuth();
  
  // Get project state management
  const {
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
  } = useProjectState();
  
  // Get project fetching operations
  const { fetchProjects } = useProjectFetching(
    setUserProjects,
    setProjectStates,
    setIsLoading,
    setProjectsOpen
  );
  
  // Get project mutation operations
  const {
    handleNewProjectButton,
    createNewProject,
    deleteProject
  } = useProjectMutations(
    setUserProjects,
    setProjectsOpen, 
    setNewProjectDialogOpen,
    setNewProjectName,
    setIsLoading
  );
  
  // Initial fetch of projects when component mounts or user changes
  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);
  
  // Close projects section when there are no projects
  useEffect(() => {
    if (userProjects.length === 0) {
      setProjectsOpen(false);
    }
  }, [userProjects, setProjectsOpen]);
  
  // Wrapper for createNewProject that uses the current state
  const handleCreateNewProject = async () => {
    await createNewProject(newProjectName);
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
    createNewProject: handleCreateNewProject,
    deleteProject,
    isLoading,
    fetchProjects
  };
};
