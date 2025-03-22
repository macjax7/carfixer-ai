import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Car, Wrench, PlusCircle, FolderPlus,
  MessageSquare, Clock
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
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
  SidebarTrigger,
  SidebarFooter
} from '@/components/ui/sidebar';

const ChatSidebar = () => {
  const location = useLocation();
  const { user } = useAuth();
  
  // Simplified navigation items (removed Home, Diagnostics, Parts & Repairs)
  const primaryNavItems = [
    {
      title: "My Vehicles",
      path: "/vehicles",
      icon: Car,
    },
  ];
  
  // Example projects (unchanged)
  const userProjects = [
    { title: "Honda Civic Issues", path: "#" },
    { title: "Truck Maintenance", path: "#" },
    { title: "DIY Repair Notes", path: "#" },
  ];

  // Example chat history (new)
  const chatHistory = [
    { title: "Check Engine Light P0420", timestamp: "2h ago", path: "#" },
    { title: "Battery Replacement Options", timestamp: "Yesterday", path: "#" },
    { title: "Brake Fluid Change", timestamp: "3d ago", path: "#" },
    { title: "Transmission Warning Signs", timestamp: "1w ago", path: "#" },
  ];

  return (
    <Sidebar>
      <SidebarHeader className="flex items-center p-4">
        <div className="flex items-center gap-2">
          <div className="rounded-md bg-carfix-600 p-1">
            <Wrench className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-lg font-semibold">CarFix AI</h1>
        </div>
        <div className="ml-auto">
          <SidebarTrigger />
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        {/* Main Navigation (simplified) */}
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
        
        {/* Projects Section - with improved visual separation */}
        <SidebarGroup className="mt-4 pt-2 border-t border-border">
          <div className="flex items-center">
            <SidebarGroupLabel>Projects</SidebarGroupLabel>
            <Button variant="ghost" size="icon" className="ml-auto mr-2 h-7 w-7">
              <FolderPlus className="h-4 w-4" />
            </Button>
          </div>
          <SidebarGroupContent>
            <SidebarMenu>
              {userProjects.map((project) => (
                <SidebarMenuItem key={project.title}>
                  <SidebarMenuButton asChild>
                    <Link to={project.path}>
                      <span>{project.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <PlusCircle className="h-4 w-4" />
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        {/* Chat History Section - New */}
        <SidebarGroup className="mt-4 pt-2 border-t border-border">
          <SidebarGroupLabel>Chat History</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {chatHistory.map((chat, index) => (
                <SidebarMenuItem key={index}>
                  <SidebarMenuButton asChild>
                    <Link to={chat.path} className="flex flex-col items-start">
                      <span className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                        <span className="truncate">{chat.title}</span>
                      </span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1 pl-6">
                        <Clock className="h-3 w-3" />
                        {chat.timestamp}
                      </span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter className="border-t p-4">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
              {user?.email?.charAt(0).toUpperCase() || 'U'}
            </div>
          </div>
          <div className="ml-3 truncate">
            <p className="text-sm font-medium truncate">{user?.email || 'User'}</p>
          </div>
          <Link to="/profile" className="ml-auto">
            <Button variant="ghost" size="icon">
              <Wrench className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

export default ChatSidebar;
