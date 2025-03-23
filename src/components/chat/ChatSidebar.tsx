
import React from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader as UISidebarHeader,
} from '@/components/ui/sidebar';

// Import the sidebar components
import NavigationSection from './sidebar/NavigationSection';
import SidebarHeader from './sidebar/SidebarHeader';
import SidebarProjects from './sidebar/SidebarProjects';
import SidebarChatHistory from './sidebar/SidebarChatHistory';
import SidebarSearchResults from './sidebar/SidebarSearchResults';
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
      
      <SidebarContent>
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
      </SidebarContent>
      
      <SidebarFooter className="border-t p-4">
        {user && (
          <div className="flex items-center">
            <div className="truncate">
              <p className="text-sm font-medium text-muted-foreground truncate">{user.email || 'User'}</p>
            </div>
          </div>
        )}
      </SidebarFooter>
      
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
