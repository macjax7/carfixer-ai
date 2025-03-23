
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Project, ProjectState, ProjectSubItem } from './types';
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';

export const useProjects = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Initialize projectsOpen to false (closed by default)
  const [projectsOpen, setProjectsOpen] = useState(false);
  const [userProjects, setUserProjects] = useState<Project[]>([]);
  const [projectStates, setProjectStates] = useState<ProjectState>({});
  const [isLoading, setIsLoading] = useState(false);
  
  // New project dialog state
  const [newProjectDialogOpen, setNewProjectDialogOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  
  // Fetch projects from Supabase
  const fetchProjects = useCallback(async () => {
    if (!user) return;
    
    setIsLoading(true);
    
    try {
      // Fetch user's projects
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (projectsError) throw projectsError;
      
      // Fetch project items for all projects
      const { data: projectItemsData, error: itemsError } = await supabase
        .from('project_items')
        .select('*')
        .in(
          'project_id', 
          projectsData.map(project => project.id)
        )
        .order('created_at', { ascending: true });
      
      if (itemsError) throw itemsError;
      
      // Get chat sessions that might be associated with projects
      const { data: chatSessionsData, error: chatSessionsError } = await supabase
        .from('chat_sessions')
        .select('*')
        .in(
          'user_id',
          [user.id]
        )
        .order('created_at', { ascending: false });
      
      if (chatSessionsError) throw chatSessionsError;
      
      // Map the data to our Project type
      const projects: Project[] = projectsData.map(project => {
        // Find project items that belong to this project
        const projectItems = projectItemsData
          ? projectItemsData.filter(item => item.project_id === project.id)
          : [];
        
        // Create sub-items from project items
        const subItems: ProjectSubItem[] = projectItems.map(item => ({
          id: item.id,
          title: item.title,
          path: item.path
        }));
        
        // Add chat sessions if needed
        if (chatSessionsData && chatSessionsData.length > 0) {
          // Process chat sessions if needed - we're not doing this now 
          // to avoid the previous errors
        }
        
        return {
          id: project.id,
          title: project.title,
          path: `/project/${project.id}`,
          subItems
        };
      });
      
      setUserProjects(projects);
      
      // Initialize project states based on projects
      const initialProjectStates: ProjectState = {};
      projects.forEach(project => {
        initialProjectStates[project.title] = false;
      });
      setProjectStates(initialProjectStates);
      
      // Open the projects section if there are projects
      if (projects.length > 0) {
        setProjectsOpen(true);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast({
        title: "Error",
        description: "Failed to load projects",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);
  
  // Initial fetch of projects when component mounts or user changes
  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);
  
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
  const createNewProject = async () => {
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
  };
  
  const deleteProject = async (projectId: string | number) => {
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
    createNewProject,
    deleteProject,
    isLoading,
    fetchProjects
  };
};
