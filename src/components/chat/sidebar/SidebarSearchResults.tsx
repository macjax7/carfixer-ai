
import React from 'react';
import { ChatHistoryItem, Project } from '@/hooks/chat/sidebar/types';
import { SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';
import { Search, MessageSquare, FolderClosed } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SidebarSearchResultsProps {
  searchQuery: string;
  searchResults: {
    projects: Project[];
    chats: ChatHistoryItem[];
  };
}

const SidebarSearchResults = ({ searchQuery, searchResults }: SidebarSearchResultsProps) => {
  const navigate = useNavigate();
  const totalResults = searchResults.projects.length + searchResults.chats.length;

  return (
    <SidebarGroup>
      <div className="py-2 px-3 text-sm text-muted-foreground flex items-center">
        <Search className="w-4 h-4 mr-2" />
        <p>
          {totalResults > 0 
            ? `Found ${totalResults} results for "${searchQuery}"`
            : `No results found for "${searchQuery}"`}
        </p>
      </div>
      
      <SidebarGroupContent>
        {searchResults.projects.length > 0 && (
          <>
            <div className="px-3 py-1 text-xs font-medium text-muted-foreground">Projects</div>
            <SidebarMenu>
              {searchResults.projects.map((project) => (
                <SidebarMenuItem key={project.id}>
                  <SidebarMenuButton onClick={() => navigate(project.path)}>
                    <FolderClosed className="h-4 w-4" />
                    <span>{project.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </>
        )}
        
        {searchResults.chats.length > 0 && (
          <>
            <div className="px-3 py-1 text-xs font-medium text-muted-foreground mt-2">Chats</div>
            <SidebarMenu>
              {searchResults.chats.map((chat) => (
                <SidebarMenuItem key={chat.id}>
                  <SidebarMenuButton onClick={() => navigate(chat.path)}>
                    <MessageSquare className="h-4 w-4" />
                    <div className="flex flex-col items-start">
                      <span className="truncate max-w-[150px]">{chat.title}</span>
                      <span className="text-xs text-muted-foreground">{chat.timestamp}</span>
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </>
        )}
        
        {totalResults === 0 && (
          <div className="p-3 text-center text-sm text-muted-foreground">
            <p>No matching results found</p>
            <p className="text-xs mt-1">Try a different search term</p>
          </div>
        )}
      </SidebarGroupContent>
    </SidebarGroup>
  );
};

export default SidebarSearchResults;
