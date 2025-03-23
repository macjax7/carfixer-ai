
import React from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  Sidebar,
  SidebarHeader as UISidebarHeader,
} from '@/components/ui/sidebar';

// Import the sidebar components
import SidebarHeader from './sidebar/SidebarHeader';
import SidebarContentComponent from './sidebar/components/SidebarContent';
import SidebarFooterComponent from './sidebar/components/SidebarFooter';
import NewProjectDialog from './sidebar/NewProjectDialog';
import { useSidebarState } from './sidebar/useSidebarState';

const ChatSidebar = () => {
  const { user } = useAuth();
  const {
    projectsOpen,
    setProjectsOpen,
    chatHistoryOpen,
    setChatHistoryOpen,
    isSearching,
    searchQuery,
    searchResults,
    newProjectDialogOpen,
    setNewProjectDialogOpen,
    newProjectName,
    setNewProjectName,
    projectStates,
    userProjects,
    chatHistory,
    toggleProject,
    handleNewProjectButton,
    createNewProject,
    handleNewChatClick,
    toggleSearch,
    handleSearch,
    canCreateNewChat
  } = useSidebarState();

  return (
    <Sidebar>
      <UISidebarHeader className="p-0">
        <SidebarHeader 
          isSearching={isSearching}
          searchQuery={searchQuery}
          toggleSearch={toggleSearch}
          handleSearch={handleSearch}
          handleNewChatClick={handleNewChatClick}
          canCreateNewChat={canCreateNewChat}
        />
      </UISidebarHeader>
      
      <SidebarContentComponent
        searchQuery={searchQuery}
        searchResults={searchResults}
        projectsOpen={projectsOpen}
        setProjectsOpen={setProjectsOpen}
        chatHistoryOpen={chatHistoryOpen}
        setChatHistoryOpen={setChatHistoryOpen}
        userProjects={userProjects}
        projectStates={projectStates}
        toggleProject={toggleProject}
        handleNewProjectButton={handleNewProjectButton}
        chatHistory={chatHistory}
      />
      
      <SidebarFooterComponent user={user} />
      
      <NewProjectDialog 
        open={newProjectDialogOpen}
        onOpenChange={setNewProjectDialogOpen}
        newProjectName={newProjectName}
        setNewProjectName={setNewProjectName}
        createNewProject={createNewProject}
      />
    </Sidebar>
  );
};

export default ChatSidebar;
