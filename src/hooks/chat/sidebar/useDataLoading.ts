import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Project, ChatHistoryItem, ProjectState } from './types';

export const useDataLoading = (
  setUserProjects: (projects: Project[]) => void,
  setChatHistory: (chats: ChatHistoryItem[]) => void,
  setProjectStates: (states: ProjectState) => void
) => {
  const { user } = useAuth();
  
  // We'll implement the actual Supabase data fetching in the future
  // For now, let's just use mock data for authenticated users only
  useEffect(() => {
    if (user) {
      // This is where we would load data from Supabase
      console.log("Would fetch projects and chat history for user:", user.id);
      
      // For now, set some mock data only for authenticated users
      const userProjects = [
        { id: 1, title: "Honda Civic Issues", path: "#", subItems: [
          { id: 11, title: "Engine Check", path: "#" },
          { id: 12, title: "Transmission Issues", path: "#" },
        ]},
        { id: 2, title: "Truck Maintenance", path: "#", subItems: [
          { id: 21, title: "Oil Change Schedule", path: "#" },
          { id: 22, title: "Brake Inspection", path: "#" },
        ]},
      ];
      
      const chatHistoryItems = [
        { id: 1, title: "Check Engine Light P0420", timestamp: "2h ago", path: "#" },
        { id: 2, title: "Battery Replacement Options", timestamp: "Yesterday", path: "#" },
      ];
      
      setUserProjects(userProjects);
      setChatHistory(chatHistoryItems);
      
      // Initialize project states based on projects
      const initialProjectStates: ProjectState = {};
      userProjects.forEach(project => {
        initialProjectStates[project.title] = false;
      });
      setProjectStates(initialProjectStates);
    } else {
      // Clear data for non-authenticated users
      setUserProjects([]);
      setChatHistory([]);
      setProjectStates({});
    }
  }, [user, setUserProjects, setChatHistory, setProjectStates]);
};
