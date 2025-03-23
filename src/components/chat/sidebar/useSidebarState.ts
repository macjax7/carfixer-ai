
import { useChat } from '@/hooks/chat/useChat';
import { useSidebar } from '@/components/ui/sidebar';
import { useProjects } from './useProjects';
import { useChatHistory } from './useChatHistory';
import { useSearch } from './useSearch';

// Re-export the ChatHistoryItem type for external use
export { type ChatHistoryItem } from './types';

export const useSidebarState = () => {
  const { handleNewChat, canCreateNewChat } = useChat();
  const { state } = useSidebar();
  
  // Import state from other hooks
  const {
    projectsOpen,
    setProjectsOpen,
    projectStates,
    userProjects,
    newProjectDialogOpen,
    setNewProjectDialogOpen,
    newProjectName,
    setNewProjectName,
    toggleProject,
    handleNewProjectButton,
    createNewProject
  } = useProjects();
  
  const {
    chatHistoryOpen,
    setChatHistoryOpen,
    chatHistory
  } = useChatHistory();
  
  const {
    isSearching,
    searchQuery,
    searchResults,
    toggleSearch,
    handleSearch
  } = useSearch(userProjects, chatHistory);
  
  // Handle start new chat
  const handleNewChatClick = () => {
    if (canCreateNewChat) {
      handleNewChat();
    }
  };

  return {
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
  };
};
