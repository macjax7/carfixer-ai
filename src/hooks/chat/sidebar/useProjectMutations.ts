
import { useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Project } from './types';
import { supabase } from '@/integrations/supabase/client';

export const useProjectMutations = (
  setUserProjects: (projects: Project[] | ((prev: Project[]) => Project[])) => void,
  setProjectsOpen: (open: boolean) => void,
  setNewProjectDialogOpen: (open: boolean) => void,
  setNewProjectName: (name: string) => void,
  setIsLoading: (loading: boolean) => void
) => {
  const { user } = useAuth();
  const { toast } = useToast();

  // Handle creating a new project
  const handleNewProjectButton = useCallback((e: React.MouseEvent) => {
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
  }, [user, toast, setNewProjectDialogOpen]);

  // Create new project handler
  const createNewProject = useCallback(async (newProjectName: string) => {
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
    
    setIsLoading(true);
    
    try {
      // Insert new project into Supabase
      const { data: project, error } = await supabase
        .from('projects')
        .insert({
          title: newProjectName,
          user_id: user.id
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Add the new project to state
      const newProject: Project = {
        id: project.id,
        title: project.title,
        path: `/project/${project.id}`,
        subItems: []
      };
      
      setUserProjects(prev => [newProject, ...prev]);
      
      setNewProjectName('');
      setNewProjectDialogOpen(false);
      
      // Open the projects section when a new project is added
      setProjectsOpen(true);
      
      toast({
        title: "Success",
        description: `Project "${newProjectName}" created successfully`,
      });
    } catch (error) {
      console.error('Error creating project:', error);
      toast({
        title: "Error",
        description: "Failed to create project",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, toast, setUserProjects, setNewProjectName, setNewProjectDialogOpen, setProjectsOpen, setIsLoading]);

  const deleteProject = useCallback(async (projectId: string | number) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to delete projects",
        variant: "destructive"
      });
      return;
    }
    
    try {
      // Delete project from Supabase
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId.toString());
      
      if (error) throw error;
      
      // Remove project from state
      setUserProjects(prev => prev.filter(project => project.id !== projectId));
      
      toast({
        title: "Success",
        description: "Project deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting project:', error);
      toast({
        title: "Error",
        description: "Failed to delete project",
        variant: "destructive"
      });
    }
  }, [user, toast, setUserProjects]);

  return {
    handleNewProjectButton,
    createNewProject,
    deleteProject
  };
};
