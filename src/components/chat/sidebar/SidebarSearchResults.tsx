
import React from 'react';
import { Link } from 'react-router-dom';
import { Folder, MessageSquare } from 'lucide-react';
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';

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

interface ChatHistoryItem {
  id: number;
  title: string;
  timestamp: string;
  path: string;
}

interface SidebarSearchResultsProps {
  searchQuery: string;
  searchResults: {
    projects: Project[];
    chats: ChatHistoryItem[];
  };
}

const SidebarSearchResults = ({ searchQuery, searchResults }: SidebarSearchResultsProps) => {
  return (
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
  );
};

export default SidebarSearchResults;
