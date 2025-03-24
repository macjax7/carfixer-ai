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
import { useSidebarState } from '@/hooks/chat/sidebar/useSidebarState';
import { useNavigate } from 'react-router-dom';
import { useChat } from '@/hooks/chat/useChat';
import { useToast } from '@/hooks/use-toast';

const ChatSidebar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { loadChatById } = useChat();
  const { toast } = useToast();
  
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
    canCreateNewChat,
    isLoadingChatHistory,
    isProjectsLoading,
    deleteProject,
    refreshChatHistory,
    fetchProjects
  } = useSidebarState();

  const handleSelectChat = async (chatId: string, e?: React.MouseEvent) => {
    try {
      if (!chatId) {
        throw new Error('Invalid chat ID');
      }
      
      await loadChatById(chatId);
      navigate(`/chat/${chatId}`);
      
      refreshChatHistory();
    } catch (error) {
      console.error("Error loading chat:", error);
      toast({
        title: "Error loading chat",
        description: "Failed to load the selected conversation. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleSelectChatWrapper = (chatId: string) => {
    return () => handleSelectChat(chatId);
  };

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
              isLoading={isProjectsLoading}
              deleteProject={deleteProject}
              onSelectChat={handleSelectChatWrapper}
              refreshProjects={fetchProjects}
            />
            
            <SidebarChatHistory 
              chatHistory={chatHistory}
              isLoading={isLoadingChatHistory}
              onSelectChat={handleSelectChat}
              refreshChatHistory={refreshChatHistory}
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
