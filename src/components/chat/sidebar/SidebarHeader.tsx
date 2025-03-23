
import React from 'react';
import { PlusCircle } from 'lucide-react';
import { SidebarTrigger, useSidebar } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import SidebarSearch from './SidebarSearch';

interface SidebarHeaderProps {
  isSearching: boolean;
  searchQuery: string;
  toggleSearch: () => void;
  handleSearch: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleNewChatClick: () => void;
  canCreateNewChat: boolean;
}

const SidebarHeader = ({
  isSearching,
  searchQuery,
  toggleSearch,
  handleSearch,
  handleNewChatClick,
  canCreateNewChat
}: SidebarHeaderProps) => {
  return (
    <div className="flex items-center justify-between p-4">
      <SidebarTrigger className="bg-background/80 backdrop-blur-sm rounded-md shadow-sm" />
      
      <div className="flex items-center gap-2">
        <SidebarSearch
          isSearching={isSearching}
          searchQuery={searchQuery}
          toggleSearch={toggleSearch}
          handleSearch={handleSearch}
        />
        
        <Button 
          variant="outline"
          size="sm"
          className="flex items-center gap-1 h-8"
          onClick={handleNewChatClick}
          disabled={!canCreateNewChat} // Button is disabled if there are no messages
        >
          <PlusCircle className="h-4 w-4" />
          <span className="text-xs">New Chat</span>
        </Button>
      </div>
    </div>
  );
};

export default SidebarHeader;
