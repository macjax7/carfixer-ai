
import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Settings, Car, PanelLeftClose } from 'lucide-react';
import { SidebarGroup, SidebarMenu, SidebarMenuItem, SidebarMenuButton, useSidebar } from '@/components/ui/sidebar';

const NavigationSection = () => {
  const { toggleSidebar } = useSidebar();

  return (
    <SidebarGroup>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton asChild>
            <NavLink 
              to="/" 
              className={({ isActive }) => 
                isActive ? 'bg-sidebar-accent text-accent-foreground' : ''
              }
            >
              <Home className="h-5 w-5" />
              <span>Home</span>
            </NavLink>
          </SidebarMenuButton>
        </SidebarMenuItem>
        
        <SidebarMenuItem>
          <SidebarMenuButton asChild>
            <NavLink 
              to="/vehicles" 
              className={({ isActive }) => 
                isActive ? 'bg-sidebar-accent text-accent-foreground' : ''
              }
            >
              <Car className="h-5 w-5" />
              <span>Vehicles</span>
            </NavLink>
          </SidebarMenuButton>
        </SidebarMenuItem>
        
        <SidebarMenuItem>
          <SidebarMenuButton asChild>
            <NavLink 
              to="/settings" 
              className={({ isActive }) => 
                isActive ? 'bg-sidebar-accent text-accent-foreground' : ''
              }
            >
              <Settings className="h-5 w-5" />
              <span>Settings</span>
            </NavLink>
          </SidebarMenuButton>
        </SidebarMenuItem>
        
        <SidebarMenuItem className="mt-auto lg:hidden">
          <SidebarMenuButton onClick={toggleSidebar}>
            <PanelLeftClose className="h-5 w-5" />
            <span>Collapse</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  );
};

export default NavigationSection;
