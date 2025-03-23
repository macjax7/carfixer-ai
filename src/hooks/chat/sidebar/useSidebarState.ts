
import { useState, useEffect } from 'react';
import { useChat } from '@/hooks/chat/useChat';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/context/AuthContext';
import { useProjects } from './useProjects';
import { useChatHistory } from './useChatHistory';
import { useSearch } from './useSearch';
import { Project, ChatHistoryItem, ProjectState } from './types';

export const useSidebarState = () => {
  const { handleNewChat, canCreateNewChat } = useChat();
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Get projects state 
  const {
    projectsOpen,
    setProjectsOpen,
    userProjects,
    setUserProjects,
    projectStates,
    setProjectStates,
    newProjectDialogOpen,
    setNewProjectDialogOpen,
    newProjectName,
    setNewProjectName,
    toggleProject,
    handleNewProjectButton,
    createNewProject,
    deleteProject,
    isLoading: isProjectsLoading,
    fetchProjects
  } = useProjects();
  
  // Get chat history state
  const {
    chatHistoryOpen,
    setChatHistoryOpen,
    chatHistory,
    setChatHistory,
    isLoading: isLoadingChatHistory,
    refreshChatHistory
  } = useChatHistory();
  
  // Get search state
  const {
    isSearching,
    searchQuery,
    searchResults,
    toggleSearch,
    handleSearch
  } = useSearch(userProjects, chatHistory);
  
  // Handle start new chat
  const handleNewChatClick = () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to save chats",
        variant: "destructive"
      });
      return;
    }
    
    if (canCreateNewChat) {
      handleNewChat();
      // After starting a new chat, refresh the chat history
      setTimeout(() => {
        refreshChatHistory();
      }, 500);
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
    deleteProject,
    handleNewChatClick,
    toggleSearch,
    handleSearch,
    canCreateNewChat,
    isLoadingChatHistory,
    isProjectsLoading,
    fetchProjects
  };
};
