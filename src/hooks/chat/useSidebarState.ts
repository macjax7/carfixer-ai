
import { useState, useEffect } from 'react';
import { useChat } from '@/hooks/chat/useChat';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

interface ProjectSubItem {
  id: number;
  title: string;
  path: string;
}

interface Project {
  id: string;
  title: string;
  path: string;
  subItems: ProjectSubItem[];
}

export interface ChatHistoryItem {
  id: string;
  title: string;
  timestamp: string;
  path: string;
}

export const useSidebarState = () => {
  const { handleNewChat, canCreateNewChat } = useChat();
  const { toast } = useToast();
  const { user } = useAuth();
  
  // State for collapsible sections
  const [projectsOpen, setProjectsOpen] = useState(true);
  const [chatHistoryOpen, setChatHistoryOpen] = useState(true);
  
  // Search-related states
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{
    projects: Project[];
    chats: ChatHistoryItem[];
  }>({
    projects: [],
    chats: []
  });
  
  // New project dialog state
  const [newProjectDialogOpen, setNewProjectDialogOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  
  // Individual project states - map string IDs to boolean open states
  const [projectStates, setProjectStates] = useState<Record<string, boolean>>({});
  
  // User projects and chats data
  const [userProjects, setUserProjects] = useState<Project[]>([]);
  const [chatHistory, setChatHistory] = useState<ChatHistoryItem[]>([]);
  
  // Fetch projects and chat history when user changes
  useEffect(() => {
    const fetchProjects = async () => {
      if (!user) {
        setUserProjects([]);
        return;
      }
      
      try {
        const { data: projectsData, error: projectsError } = await supabase
          .from('projects')
          .select('*')
          .eq('user_id', user.id)
          .order('updated_at', { ascending: false });
        
        if (projectsError) {
          throw projectsError;
        }
        
        // Initialize project states for all projects
        const newProjectStates: Record<string, boolean> = {};
        
        // Fetch project items for each project
        const projectsWithItems = await Promise.all(
          projectsData.map(async (project) => {
            const { data: itemsData, error: itemsError } = await supabase
              .from('project_items')
              .select('*')
              .eq('project_id', project.id)
              .order('created_at', { ascending: true });
            
            if (itemsError) {
              console.error('Error fetching project items:', itemsError);
              return {
                id: project.id,
                title: project.title,
                path: `#project/${project.id}`,
                subItems: []
              };
            }
            
            // Convert project items to the expected format
            const subItems = itemsData.map(item => ({
              id: parseInt(item.id),
              title: item.title,
              path: item.chat_session_id ? `#/chat/${item.chat_session_id}` : `#/item/${item.id}`
            }));
            
            // Initialize this project's state to closed
            newProjectStates[project.id] = false;
            
            return {
              id: project.id,
              title: project.title,
              path: `#project/${project.id}`,
              subItems
            };
          })
        );
        
        setUserProjects(projectsWithItems);
        setProjectStates(prevStates => ({
          ...prevStates,
          ...newProjectStates
        }));
      } catch (error) {
        console.error('Error fetching projects:', error);
        toast({
          title: "Error",
          description: "Failed to load your projects. Please try again.",
          variant: "destructive"
        });
      }
    };
    
    const fetchChatHistory = async () => {
      if (!user) {
        setChatHistory([]);
        return;
      }
      
      try {
        const { data: chatData, error: chatError } = await supabase
          .from('chat_sessions')
          .select('*')
          .eq('user_id', user.id)
          .order('updated_at', { ascending: false })
          .limit(10);
        
        if (chatError) {
          throw chatError;
        }
        
        const formattedChatHistory: ChatHistoryItem[] = chatData.map(chat => {
          // Convert date to relative time
          const date = new Date(chat.updated_at);
          const now = new Date();
          const diffMs = now.getTime() - date.getTime();
          const diffMins = Math.round(diffMs / (1000 * 60));
          const diffHours = Math.round(diffMs / (1000 * 60 * 60));
          const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
          
          let timestamp = '';
          if (diffMins < 60) {
            timestamp = `${diffMins}m ago`;
          } else if (diffHours < 24) {
            timestamp = `${diffHours}h ago`;
          } else if (diffDays < 7) {
            timestamp = `${diffDays}d ago`;
          } else {
            timestamp = date.toLocaleDateString();
          }
          
          return {
            id: chat.id,
            title: chat.title,
            timestamp,
            path: `#/chat/${chat.id}`
          };
        });
        
        setChatHistory(formattedChatHistory);
      } catch (error) {
        console.error('Error fetching chat history:', error);
        toast({
          title: "Error",
          description: "Failed to load your chat history. Please try again.",
          variant: "destructive"
        });
      }
    };
    
    fetchProjects();
    fetchChatHistory();
    
    // Set up subscriptions for real-time updates
    let projectsSubscription: ReturnType<typeof supabase.channel> | null = null;
    let chatSubscription: ReturnType<typeof supabase.channel> | null = null;
    
    if (user) {
      projectsSubscription = supabase
        .channel('projects-changes')
        .on('postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: 'projects',
            filter: `user_id=eq.${user.id}`
          }, 
          () => {
            fetchProjects();
          }
        )
        .on('postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: 'project_items'
          }, 
          () => {
            // This might need to be optimized to only fetch affected projects
            fetchProjects();
          }
        )
        .subscribe();
        
      chatSubscription = supabase
        .channel('chat-changes')
        .on('postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: 'chat_sessions',
            filter: `user_id=eq.${user.id}`
          }, 
          () => {
            fetchChatHistory();
          }
        )
        .subscribe();
    }
    
    return () => {
      if (projectsSubscription) {
        supabase.removeChannel(projectsSubscription);
      }
      if (chatSubscription) {
        supabase.removeChannel(chatSubscription);
      }
    };
  }, [user, toast]);
  
  const toggleProject = (projectId: string) => {
    setProjectStates(prev => ({
      ...prev,
      [projectId]: !prev[projectId]
    }));
  };
  
  // Handle creating a new project
  const handleNewProjectButton = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the parent collapsible
    setNewProjectDialogOpen(true);
  };
  
  // Create new project handler
  const createNewProject = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to create a project",
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
    
    try {
      const { data, error } = await supabase
        .from('projects')
        .insert([
          { title: newProjectName, user_id: user.id }
        ])
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      setNewProjectName('');
      setNewProjectDialogOpen(false);
      
      toast({
        title: "Success",
        description: `Project "${newProjectName}" created successfully`,
      });
      
      // The new project will be added by the subscription
    } catch (error) {
      console.error('Error creating project:', error);
      toast({
        title: "Error",
        description: "Failed to create project. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  // Handle start new chat
  const handleNewChatClick = () => {
    if (canCreateNewChat) {
      handleNewChat();
    }
  };
  
  // Toggle search mode
  const toggleSearch = () => {
    setIsSearching(!isSearching);
    setSearchQuery('');
    setSearchResults({ projects: [], chats: [] });
  };
  
  // Search function
  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    
    if (!query || !user) {
      setSearchResults({ projects: [], chats: [] });
      return;
    }
    
    try {
      // Search projects and project items
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)
        .ilike('title', `%${query}%`);
      
      if (projectsError) {
        throw projectsError;
      }
      
      // Get all project IDs to search for project items
      const projectIds = projectsData.map(p => p.id);
      
      const { data: projectItemsData, error: itemsError } = await supabase
        .from('project_items')
        .select('*')
        .in('project_id', projectIds.length > 0 ? projectIds : ['none'])
        .ilike('title', `%${query}%`);
      
      if (itemsError) {
        throw itemsError;
      }
      
      // Group items by project
      const projectItemsMap: Record<string, ProjectSubItem[]> = {};
      projectItemsData.forEach(item => {
        if (!projectItemsMap[item.project_id]) {
          projectItemsMap[item.project_id] = [];
        }
        
        projectItemsMap[item.project_id].push({
          id: parseInt(item.id),
          title: item.title,
          path: item.chat_session_id ? `#/chat/${item.chat_session_id}` : `#/item/${item.id}`
        });
      });
      
      // Combine projects with their items
      const matchedProjects: Project[] = projectsData.map(project => ({
        id: project.id,
        title: project.title,
        path: `#project/${project.id}`,
        subItems: projectItemsMap[project.id] || []
      }));
      
      // Search chat history
      const { data: chatData, error: chatError } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('user_id', user.id)
        .ilike('title', `%${query}%`)
        .order('updated_at', { ascending: false });
      
      if (chatError) {
        throw chatError;
      }
      
      const matchedChats: ChatHistoryItem[] = chatData.map(chat => {
        const date = new Date(chat.updated_at);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.round(diffMs / (1000 * 60));
        const diffHours = Math.round(diffMs / (1000 * 60 * 60));
        const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
        
        let timestamp = '';
        if (diffMins < 60) {
          timestamp = `${diffMins}m ago`;
        } else if (diffHours < 24) {
          timestamp = `${diffHours}h ago`;
        } else if (diffDays < 7) {
          timestamp = `${diffDays}d ago`;
        } else {
          timestamp = date.toLocaleDateString();
        }
        
        return {
          id: chat.id,
          title: chat.title,
          timestamp,
          path: `#/chat/${chat.id}`
        };
      });
      
      setSearchResults({
        projects: matchedProjects,
        chats: matchedChats
      });
    } catch (error) {
      console.error('Error searching:', error);
      toast({
        title: "Error",
        description: "Failed to perform search. Please try again.",
        variant: "destructive"
      });
    }
  };

  return {
    projectsOpen,
    setProjectsOpen,
    chatHistoryOpen,
    setChatHistoryOpen,
    isSearching,
    searchQuery,
    searchResults,
    newProjectDialogOpen,
    setNewProjectDialogOpen,
    newProjectName,
    setNewProjectName,
    projectStates,
    userProjects,
    chatHistory,
    toggleProject,
    handleNewProjectButton,
    createNewProject,
    handleNewChatClick,
    toggleSearch,
    handleSearch,
    canCreateNewChat
  };
};
