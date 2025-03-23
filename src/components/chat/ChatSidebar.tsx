import React, { useState, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Car, FolderPlus, PlusCircle,
  MessageSquare, Clock, Search,
  ChevronDown, ChevronRight, Folder,
  X
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarTrigger,
  useSidebar
} from '@/components/ui/sidebar';

const ChatSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { state } = useSidebar();
  const searchInputRef = useRef(null);
  
  // State for collapsible sections
  const [projectsOpen, setProjectsOpen] = useState(true);
  const [chatHistoryOpen, setChatHistoryOpen] = useState(true);
  
  // Search-related states
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState({
    projects: [],
    chats: []
  });
  
  // New project dialog state
  const [newProjectDialogOpen, setNewProjectDialogOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  
  // Individual project states
  const [projectStates, setProjectStates] = useState({
    "Honda Civic Issues": false,
    "Truck Maintenance": false,
    "DIY Repair Notes": false,
  });
  
  // User projects and chats data
  const [userProjects, setUserProjects] = useState([
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
  
  const [chatHistory, setChatHistory] = useState([
    { id: 1, title: "Check Engine Light P0420", timestamp: "2h ago", path: "#" },
    { id: 2, title: "Battery Replacement Options", timestamp: "Yesterday", path: "#" },
    { id: 3, title: "Brake Fluid Change", timestamp: "3d ago", path: "#" },
    { id: 4, title: "Transmission Warning Signs", timestamp: "1w ago", path: "#" },
  ]);
  
  const toggleProject = (project) => {
    setProjectStates(prev => ({
      ...prev,
      [project]: !prev[project]
    }));
  };
  
  const handleNewProject = (e) => {
    e.stopPropagation();
    setNewProjectDialogOpen(true);
  };
  
  const createNewProject = () => {
    if (!newProjectName.trim()) {
      toast({
        title: "Error",
        description: "Project name cannot be empty",
        variant: "destructive"
      });
      return;
    }
    
    const newProject = {
      id: Date.now(),
      title: newProjectName,
      path: "#",
      subItems: []
    };
    
    setUserProjects(prev => [...prev, newProject]);
    
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
  
  const handleNewChat = () => {
    navigate('/');
    toast({
      title: "New Chat",
      description: "Started a new chat session",
    });
  };
  
  const toggleSearch = () => {
    setIsSearching(!isSearching);
    setSearchQuery('');
    setSearchResults({ projects: [], chats: [] });
    
    if (!isSearching && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current.focus();
      }, 100);
    }
  };
  
  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    
    if (!query) {
      setSearchResults({ projects: [], chats: [] });
      return;
    }
    
    const filteredProjects = userProjects.filter(project => 
      project.title.toLowerCase().includes(query) ||
      project.subItems.some(item => item.title.toLowerCase().includes(query))
    );
    
    const matchedProjects = filteredProjects.map(project => ({
      ...project,
      subItems: project.subItems.filter(item => 
        item.title.toLowerCase().includes(query) || project.title.toLowerCase().includes(query)
      )
    }));
    
    const filteredChats = chatHistory.filter(chat => 
      chat.title.toLowerCase().includes(query)
    );
    
    setSearchResults({
      projects: matchedProjects,
      chats: filteredChats
    });
  };

  const primaryNavItems = [
    {
      title: "My Vehicles",
      path: "/vehicles",
      icon: Car,
    },
  ];

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <div className="flex items-center justify-between">
          <SidebarTrigger className="bg-background/80 backdrop-blur-sm rounded-md shadow-sm" />
          
          <div className="flex items-center gap-2">
            {isSearching ? (
              <div className="flex items-center gap-1 bg-background/90 border rounded-md px-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  ref={searchInputRef}
                  value={searchQuery}
                  onChange={handleSearch}
                  placeholder="Search..."
                  className="h-8 w-36 border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                />
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8" 
                  onClick={toggleSearch}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8"
                onClick={toggleSearch}
              >
                <Search className="h-4 w-4" />
              </Button>
            )}
            
            <Button 
              variant="outline"
              size="sm"
              className="flex items-center gap-1 h-8"
              onClick={handleNewChat}
            >
              <PlusCircle className="h-4 w-4" />
              <span className="text-xs">New Chat</span>
            </Button>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        {searchQuery ? (
          <div className="px-2 py-2">
            <div className="text-xs text-muted-foreground mb-2">
              Search results for "{searchQuery}"
            </div>
            
            {searchResults.projects.length > 0 && (
              <div className="mb-4">
                <div className="text-xs font-medium mb-1 text-muted-foreground">Projects</div>
                <SidebarMenu>
                  {searchResults.projects.map((project) => (
                    <SidebarMenuItem key={project.id}>
                      <SidebarMenuButton asChild>
                        <Link to={project.path}>
                          <Folder className="h-4 w-4 text-muted-foreground" />
                          <span>{project.title}</span>
                        </Link>
                      </SidebarMenuButton>
                      
                      {project.subItems.length > 0 && (
                        <ul className="ml-6 mt-1 space-y-1">
                          {project.subItems.map((subItem) => (
                            <li key={subItem.id}>
                              <Link 
                                to={subItem.path}
                                className="flex items-center text-sm py-1 px-2 rounded-md hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                              >
                                <span className="truncate">{subItem.title}</span>
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </div>
            )}
            
            {searchResults.chats.length > 0 && (
              <div>
                <div className="text-xs font-medium mb-1 text-muted-foreground">Chat History</div>
                <SidebarMenu>
                  {searchResults.chats.map((chat) => (
                    <SidebarMenuItem key={chat.id}>
                      <SidebarMenuButton asChild>
                        <Link to={chat.path}>
                          <MessageSquare className="h-4 w-4 text-muted-foreground" />
                          <span>{chat.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </div>
            )}
            
            {searchResults.projects.length === 0 && searchResults.chats.length === 0 && (
              <div className="text-sm text-center py-4 text-muted-foreground">
                No results found
              </div>
            )}
          </div>
        ) : (
          <>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {primaryNavItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton 
                        asChild 
                        isActive={location.pathname === item.path}
                        tooltip={item.title}
                      >
                        <Link to={item.path}>
                          <item.icon />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
            
            <SidebarGroup className="mt-4 pt-2 border-t border-border">
              <Collapsible
                open={projectsOpen}
                onOpenChange={setProjectsOpen}
                className="w-full"
              >
                <div className="flex items-center">
                  <CollapsibleTrigger asChild>
                    <button className="flex items-center flex-grow p-2 text-sm font-medium hover:bg-sidebar-accent rounded-md transition-colors">
                      <span className="flex-1 flex items-center">
                        {projectsOpen ? 
                          <ChevronDown className="h-4 w-4 mr-2 text-muted-foreground" /> : 
                          <ChevronRight className="h-4 w-4 mr-2 text-muted-foreground" />}
                        Projects
                      </span>
                    </button>
                  </CollapsibleTrigger>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-7 w-7 mr-2" 
                    onClick={handleNewProject}
                  >
                    <FolderPlus className="h-4 w-4" />
                  </Button>
                </div>
                
                <CollapsibleContent className="transition-all duration-200 ease-in-out">
                  <SidebarGroupContent>
                    <SidebarMenu>
                      {userProjects.map((project) => (
                        <div key={project.id}>
                          <Collapsible 
                            open={projectStates[project.title]} 
                            onOpenChange={() => toggleProject(project.title)}
                          >
                            <CollapsibleTrigger asChild>
                              <SidebarMenuButton className="flex items-center justify-between w-full">
                                <div className="flex items-center">
                                  <Folder className="h-4 w-4 mr-2 text-muted-foreground" />
                                  <span>{project.title}</span>
                                </div>
                                {projectStates[project.title] ? 
                                  <ChevronDown className="h-3 w-3 text-muted-foreground ml-1" /> : 
                                  <ChevronRight className="h-3 w-3 text-muted-foreground ml-1" />}
                              </SidebarMenuButton>
                            </CollapsibleTrigger>
                            <CollapsibleContent className="pl-6 transition-all duration-200 ease-in-out">
                              {project.subItems.map((subItem) => (
                                <SidebarMenuItem key={subItem.id}>
                                  <SidebarMenuButton asChild className="text-sm">
                                    <Link to={subItem.path}>
                                      <span>{subItem.title}</span>
                                    </Link>
                                  </SidebarMenuButton>
                                </SidebarMenuItem>
                              ))}
                            </CollapsibleContent>
                          </Collapsible>
                        </div>
                      ))}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </CollapsibleContent>
              </Collapsible>
            </SidebarGroup>
            
            <SidebarGroup className="mt-4 pt-2 border-t border-border">
              <Collapsible
                open={chatHistoryOpen}
                onOpenChange={setChatHistoryOpen}
                className="w-full"
              >
                <CollapsibleTrigger asChild>
                  <button className="flex items-center w-full p-2 text-sm font-medium hover:bg-sidebar-accent rounded-md transition-colors">
                    <span className="flex-1 flex items-center">
                      {chatHistoryOpen ? 
                        <ChevronDown className="h-4 w-4 mr-2 text-muted-foreground" /> : 
                        <ChevronRight className="h-4 w-4 mr-2 text-muted-foreground" />}
                      Chat History
                    </span>
                  </button>
                </CollapsibleTrigger>
                
                <CollapsibleContent className="transition-all duration-200 ease-in-out">
                  <SidebarGroupContent>
                    <SidebarMenu>
                      {chatHistory.map((chat) => (
                        <SidebarMenuItem key={chat.id}>
                          <SidebarMenuButton asChild className="block w-full px-2 py-2">
                            <Link to={chat.path} className="w-full">
                              <div className="flex flex-col w-full">
                                <span className="text-base font-normal truncate text-sidebar-foreground">{chat.title}</span>
                                <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                  <Clock className="h-3 w-3 flex-shrink-0" />
                                  <span className="truncate">{chat.timestamp}</span>
                                </div>
                              </div>
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </CollapsibleContent>
              </Collapsible>
            </SidebarGroup>
          </>
        )}
      </SidebarContent>
      
      <Dialog open={newProjectDialogOpen} onOpenChange={setNewProjectDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Input
                id="project-name"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                placeholder="Project name"
                className="col-span-4"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    createNewProject();
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewProjectDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={createNewProject}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Sidebar>
  );
};

export default ChatSidebar;
