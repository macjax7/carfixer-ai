
import { useState } from 'react';
import { SearchResults, Project, ChatHistoryItem } from './types';

export const useSearch = (userProjects: Project[], chatHistory: ChatHistoryItem[]) => {
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResults>({
    projects: [],
    chats: []
  });

  // Toggle search mode
  const toggleSearch = () => {
    setIsSearching(!isSearching);
    setSearchQuery('');
    setSearchResults({ projects: [], chats: [] });
  };

  // Search function
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    
    if (!query) {
      setSearchResults({ projects: [], chats: [] });
      return;
    }
    
    // Search projects
    const filteredProjects = userProjects.filter(project => 
      project.title.toLowerCase().includes(query) ||
      project.subItems.some(item => item.title.toLowerCase().includes(query))
    );
    
    // Get matching sub-items for matched projects
    const matchedProjects = filteredProjects.map(project => ({
      ...project,
      subItems: project.subItems.filter(item => 
        item.title.toLowerCase().includes(query) || project.title.toLowerCase().includes(query)
      )
    }));
    
    // Search chat history
    const filteredChats = chatHistory.filter(chat => 
      chat.title.toLowerCase().includes(query)
    );
    
    setSearchResults({
      projects: matchedProjects,
      chats: filteredChats
    });
  };

  return {
    isSearching,
    searchQuery,
    searchResults,
    toggleSearch,
    handleSearch
  };
};
