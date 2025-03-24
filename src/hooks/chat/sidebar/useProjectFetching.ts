
import { useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Project, ProjectState, ProjectSubItem } from './types';
import { supabase } from '@/integrations/supabase/client';

export const useProjectFetching = (
  setUserProjects: (projects: Project[]) => void,
  setProjectStates: (states: ProjectState) => void,
  setIsLoading: (loading: boolean) => void,
  setProjectsOpen: (open: boolean) => void
) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
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
  }, [user, toast, setUserProjects, setProjectStates, setIsLoading, setProjectsOpen]);

  return {
    fetchProjects
  };
};
