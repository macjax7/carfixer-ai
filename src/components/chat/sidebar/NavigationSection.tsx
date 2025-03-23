
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Car } from 'lucide-react';
import { SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';

interface NavigationItem {
  title: string;
  path: string;
  icon: React.ComponentType<any>;
}

const NavigationSection = () => {
  const location = useLocation();

  const primaryNavItems: NavigationItem[] = [
    {
      title: "My Vehicles",
      path: "/vehicles",
      icon: Car,
    },
  ];

  return (
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
  );
};

export default NavigationSection;
