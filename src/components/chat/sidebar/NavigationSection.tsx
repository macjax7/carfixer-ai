
import React from 'react';
import { NavLink } from 'react-router-dom';
import { Car, Settings } from 'lucide-react';
import { SidebarGroup, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';

const NavigationSection = () => {
  return (
    <SidebarGroup>
      <SidebarMenu>
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
      </SidebarMenu>
    </SidebarGroup>
  );
};

export default NavigationSection;
