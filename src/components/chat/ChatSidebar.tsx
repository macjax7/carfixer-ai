
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Car, Wrench, PlusCircle, FolderPlus,
  MessageSquare, Clock, Search,
  ChevronDown, ChevronUp, Folder
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import ProfileMenu from '@/components/ProfileMenu';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
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
  const { user } = useAuth();
  const { state } = useSidebar();
  
  // State for collapsible sections
  const [projectsOpen, setProjectsOpen] = useState(true);
  const [chatHistoryOpen, setChatHistoryOpen] = useState(true);
  
  const primaryNavItems = [
    {
      title: "My Vehicles",
      path: "/vehicles",
      icon: Car,
    },
  ];

  const userProjects = [
    { title: "Honda Civic Issues", path: "#" },
    { title: "Truck Maintenance", path: "#" },
    { title: "DIY Repair Notes", path: "#" },
  ];

  const chatHistory = [
    { title: "Check Engine Light P0420", timestamp: "2h ago", path: "#" },
    { title: "Battery Replacement Options", timestamp: "Yesterday", path: "#" },
    { title: "Brake Fluid Change", timestamp: "3d ago", path: "#" },
    { title: "Transmission Warning Signs", timestamp: "1w ago", path: "#" },
  ];

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <div className="flex items-center justify-between">
          <SidebarTrigger className="bg-background/80 backdrop-blur-sm rounded-md shadow-sm" />
          
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Search className="h-4 w-4" />
            </Button>
            
            <Button 
              variant="outline"
              size="sm"
              className="flex items-center gap-1 h-8"
            >
              <PlusCircle className="h-4 w-4" />
              <span className="text-xs">New Chat</span>
            </Button>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
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
                <button className="flex items-center w-full p-2 text-sm font-medium hover:bg-sidebar-accent rounded-md transition-colors">
                  <span className="flex-1 flex items-center">
                    {projectsOpen ? 
                      <ChevronDown className="h-4 w-4 mr-2 text-muted-foreground" /> : 
                      <ChevronUp className="h-4 w-4 mr-2 text-muted-foreground" />}
                    Projects
                  </span>
                  <Button variant="ghost" size="icon" className="ml-auto h-7 w-7">
                    <FolderPlus className="h-4 w-4" />
                  </Button>
                </button>
              </CollapsibleTrigger>
            </div>
            
            <CollapsibleContent className="transition-all duration-200 ease-in-out">
              <SidebarGroupContent>
                <SidebarMenu>
                  {userProjects.map((project) => (
                    <SidebarMenuItem key={project.title}>
                      <SidebarMenuButton asChild>
                        <Link to={project.path} className="flex items-center">
                          <Folder className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>{project.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                  <SidebarMenuItem>
                    <SidebarMenuButton className="text-muted-foreground">
                      <PlusCircle className="h-4 w-4" />
                      <span>New Project</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
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
                    <ChevronUp className="h-4 w-4 mr-2 text-muted-foreground" />}
                  Chat History
                </span>
              </button>
            </CollapsibleTrigger>
            
            <CollapsibleContent className="transition-all duration-200 ease-in-out">
              <SidebarGroupContent>
                <SidebarMenu>
                  {chatHistory.map((chat, index) => (
                    <SidebarMenuItem key={index}>
                      <SidebarMenuButton asChild>
                        <Link to={chat.path} className="flex flex-col items-start">
                          <span className="truncate">{chat.title}</span>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {chat.timestamp}
                          </span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </Collapsible>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter className="border-t p-4">
        <div className="flex items-center">
          <ProfileMenu />
          <div className="ml-3 truncate">
            <p className="text-sm font-medium truncate">{user?.email || 'User'}</p>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

export default ChatSidebar;
