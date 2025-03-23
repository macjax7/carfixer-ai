
import { useState, useEffect } from 'react';
import { useChat } from '@/hooks/chat/useChat';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/context/AuthContext';

interface ProjectSubItem {
  id: number | string;
  title: string;
  path: string;
}

interface Project {
  id: number | string;
  title: string;
  path: string;
  subItems: ProjectSubItem[];
}

export interface ChatHistoryItem {
  id: number | string;
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
  
  // Individual project states
  const [projectStates, setProjectStates] = useState<Record<string, boolean>>({});
  
  // User projects and chats data - initialize as empty
  const [userProjects, setUserProjects] = useState<Project[]>([]);
  const [chatHistory, setChatHistory] = useState<ChatHistoryItem[]>([]);
  
  // We'll implement the actual Supabase data fetching in the future
  // For now, let's just use mock data for authenticated users only
  useEffect(() => {
    if (user) {
      // This is where we would load data from Supabase
      console.log("Would fetch projects and chat history for user:", user.id);
      
      // For now, set some mock data only for authenticated users
      setUserProjects([
        { id: 1, title: "Honda Civic Issues", path: "#", subItems: [
          { id: 11, title: "Engine Check", path: "#" },
          { id: 12, title: "Transmission Issues", path: "#" },
        ]},
        { id: 2, title: "Truck Maintenance", path: "#", subItems: [
          { id: 21, title: "Oil Change Schedule", path: "#" },
          { id: 22, title: "Brake Inspection", path: "#" },
        ]},
      ]);
      
      setChatHistory([
        { id: 1, title: "Check Engine Light P0420", timestamp: "2h ago", path: "#" },
        { id: 2, title: "Battery Replacement Options", timestamp: "Yesterday", path: "#" },
      ]);
      
      // Initialize project states based on projects
      const initialProjectStates: Record<string, boolean> = {};
      userProjects.forEach(project => {
        initialProjectStates[project.title] = false;
      });
      setProjectStates(initialProjectStates);
    } else {
      // Clear data for non-authenticated users
      setUserProjects([]);
      setChatHistory([]);
      setProjectStates({});
    }
  }, [user]);
  
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
  
  // Handle start new chat
  const handleNewChatClick = () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to save chats",
        variant: "destructive"
      });
      return;
    }
    
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
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    
    if (!query) {
      setSearchResults({ projects: [], chats: [] });
      return;
    }
    
    // Search projects
    const filteredProjects = userProjects.filter(project => 
      project.title.toLowerCase().includes(query) ||
      project.subItems.some(item => item.title.toLowerCase().includes(query))
    );
    
    // Get matching sub-items for matched projects
    const matchedProjects = filteredProjects.map(project => ({
      ...project,
      subItems: project.subItems.filter(item => 
        item.title.toLowerCase().includes(query) || project.title.toLowerCase().includes(query)
      )
    }));
    
    // Search chat history
    const filteredChats = chatHistory.filter(chat => 
      chat.title.toLowerCase().includes(query)
    );
    
    setSearchResults({
      projects: matchedProjects,
      chats: filteredChats
    });
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
