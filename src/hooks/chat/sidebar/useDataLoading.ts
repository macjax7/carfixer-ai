
import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Project, ChatHistoryItem, ProjectState } from './types';

export const useDataLoading = (
  setUserProjects: React.Dispatch<React.SetStateAction<Project[]>>,
  setChatHistory: React.Dispatch<React.SetStateAction<ChatHistoryItem[]>>,
  setProjectStates: React.Dispatch<React.SetStateAction<ProjectState>>
) => {
  const { user } = useAuth();

  // Load user data
  useEffect(() => {
    if (user) {
      // This is where we would load data from Supabase
      console.log("Would fetch projects and chat history for user:", user.id);
      
      // For now, set some mock data only for authenticated users
      setUserProjects([
        { id: 1, title: "Honda Civic Issues", path: "#", subItems: [
          { id: 11, title: "Engine Check", path: "#" },
          { id: 12, title: "Transmission Issues", path: "#" },
        ]},
        { id: 2, title: "Truck Maintenance", path: "#", subItems: [
          { id: 21, title: "Oil Change Schedule", path: "#" },
          { id: 22, title: "Brake Inspection", path: "#" },
        ]},
      ]);
      
      setChatHistory([
        { id: 1, title: "Check Engine Light P0420", timestamp: "2h ago", path: "#" },
        { id: 2, title: "Battery Replacement Options", timestamp: "Yesterday", path: "#" },
      ]);
      
      // Initialize project states based on projects
      const initialProjectStates: ProjectState = {};
      ["Honda Civic Issues", "Truck Maintenance"].forEach(project => {
        initialProjectStates[project] = false;
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
