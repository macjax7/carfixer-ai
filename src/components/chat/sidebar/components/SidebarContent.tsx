
import React from 'react';
import { SidebarContent as UISidebarContent } from '@/components/ui/sidebar';
import NavigationSection from '../NavigationSection';
import SidebarProjects from '../SidebarProjects';
import SidebarChatHistory from '../SidebarChatHistory';
import SidebarSearchResults from '../SidebarSearchResults';

interface SidebarContentProps {
  searchQuery: string;
  searchResults: {
    projects: any[];
    chats: any[];
  };
  projectsOpen: boolean;
  setProjectsOpen: (open: boolean) => void;
  chatHistoryOpen: boolean;
  setChatHistoryOpen: (open: boolean) => void;
  userProjects: any[];
  projectStates: Record<string, boolean>;
  toggleProject: (project: string) => void;
  handleNewProjectButton: (e: React.MouseEvent) => void;
  chatHistory: any[];
}

const SidebarContentComponent: React.FC<SidebarContentProps> = ({
  searchQuery,
  searchResults,
  projectsOpen,
  setProjectsOpen,
  chatHistoryOpen,
  setChatHistoryOpen,
  userProjects,
  projectStates,
  toggleProject,
  handleNewProjectButton,
  chatHistory
}) => {
  return (
    <UISidebarContent>
      {searchQuery ? (
        <SidebarSearchResults 
          searchQuery={searchQuery}
          searchResults={searchResults}
        />
      ) : (
        <>
          <NavigationSection />
          
          <SidebarProjects 
            projectsOpen={projectsOpen}
            setProjectsOpen={setProjectsOpen}
            userProjects={userProjects}
            projectStates={projectStates}
            toggleProject={toggleProject}
            handleNewProjectButton={handleNewProjectButton}
          />
          
          <SidebarChatHistory 
            chatHistoryOpen={chatHistoryOpen}
            setChatHistoryOpen={setChatHistoryOpen}
            chatHistory={chatHistory}
          />
        </>
      )}
    </UISidebarContent>
  );
};

export default SidebarContentComponent;
