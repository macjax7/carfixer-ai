import { useState, useEffect } from 'react';
import { useChat } from '@/hooks/chat/useChat';
import { useToast } from '@/components/ui/use-toast';
import { useSidebar } from '@/components/ui/sidebar';

interface ProjectSubItem {
  id: number;
  title: string;
  path: string;
}

interface Project {
  id: number;
  title: string;
  path: string;
  subItems: ProjectSubItem[];
}

export interface ChatHistoryItem {
  id: number;
  title: string;
  timestamp: string;
  path: string;
}

export const useSidebarState = () => {
  const { handleNewChat, canCreateNewChat } = useChat();
  const { toast } = useToast();
  const { setOpen } = useSidebar();
  
  // Set sidebar to collapsed on initial load
  useEffect(() => {
    setOpen(false);
  }, [setOpen]);
  
  // State for collapsible sections - set to false (collapsed) by default
  const [projectsOpen, setProjectsOpen] = useState(false);
  const [chatHistoryOpen, setChatHistoryOpen] = useState(false);
  
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
  
  // Individual project states - all collapsed by default
  const [projectStates, setProjectStates] = useState<Record<string, boolean>>({
    "Honda Civic Issues": false,
    "Truck Maintenance": false,
    "DIY Repair Notes": false,
  });
  
  // User projects and chats data
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
  
  const [chatHistory, setChatHistory] = useState<ChatHistoryItem[]>([
    { id: 1, title: "Check Engine Light P0420", timestamp: "2h ago", path: "#" },
    { id: 2, title: "Battery Replacement Options", timestamp: "Yesterday", path: "#" },
    { id: 3, title: "Brake Fluid Change", timestamp: "3d ago", path: "#" },
    { id: 4, title: "Transmission Warning Signs", timestamp: "1w ago", path: "#" },
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
