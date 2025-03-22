
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Car, Wrench, Home, Settings, 
  BarChart2, PlusCircle, FolderPlus
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
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
  
  const primaryNavItems = [
    {
      title: "Home",
      path: "/chat",
      icon: Home,
    },
    {
      title: "My Vehicles",
      path: "/vehicles",
      icon: Car,
    },
    {
      title: "Diagnostics",
      path: "/scan",
      icon: BarChart2,
    },
    {
      title: "Parts & Repairs",
      path: "#",
      icon: Wrench,
    },
  ];
  
  const userProjects = [
    { title: "Honda Civic Issues", path: "#" },
    { title: "Truck Maintenance", path: "#" },
    { title: "DIY Repair Notes", path: "#" },
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
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
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
        
        {/* Projects/Saved Content */}
        <SidebarGroup>
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
                  <span>New Project</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
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
              <Settings className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

export default ChatSidebar;
