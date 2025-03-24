
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { ChatHistoryItem } from './types';
import { formatDistanceToNow } from 'date-fns';

export const useChatHistory = () => {
  const { user } = useAuth();
  
  // Initialize chatHistoryOpen to false (closed by default)
  const [chatHistoryOpen, setChatHistoryOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Fetch chat history from Supabase when user is authenticated
  useEffect(() => {
    const fetchChatHistory = async () => {
      if (!user) {
        setChatHistory([]);
        return;
      }
      
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('chat_sessions')
          .select('*')
          .eq('user_id', user.id)
          .order('updated_at', { ascending: false });
        
        if (error) {
          console.error('Error fetching chat history:', error);
          return;
        }
        
        // Format the data into ChatHistoryItem format
        const formattedData = data.map(session => ({
          id: session.id,
          title: session.title || 'Untitled Chat',
          timestamp: formatRelativeTime(session.updated_at),
          path: `/chat/${session.id}`,
          // Store the original updated_at for sorting preservation
          updated_at: session.updated_at
        }));
        
        setChatHistory(formattedData);
        
        // Open chat history if there are items
        if (formattedData.length > 0) {
          setChatHistoryOpen(true);
        }
      } catch (error) {
        console.error('Error in fetchChatHistory:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchChatHistory();
  }, [user]);
  
  // Helper function to format timestamps in a relative format
  const formatRelativeTime = (isoString: string) => {
    try {
      return formatDistanceToNow(new Date(isoString), { addSuffix: true });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'recently';
    }
  };
  
  // Function to refresh chat history (useful after creating a new chat)
  const refreshChatHistory = useCallback(async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });
      
      if (error) {
        console.error('Error refreshing chat history:', error);
        return;
      }
      
      // Format the data into ChatHistoryItem format while preserving the original order
      const formattedData = data.map(session => ({
        id: session.id,
        title: session.title || 'Untitled Chat',
        timestamp: formatRelativeTime(session.updated_at),
        path: `/chat/${session.id}`,
        updated_at: session.updated_at
      }));
      
      setChatHistory(formattedData);
    } catch (error) {
      console.error('Error in refreshChatHistory:', error);
    }
  }, [user]);
  
  // Close chat history section when there are no chats
  useEffect(() => {
    if (chatHistory.length === 0) {
      setChatHistoryOpen(false);
    }
  }, [chatHistory]);

  return {
    chatHistoryOpen,
    setChatHistoryOpen,
    chatHistory,
    setChatHistory,
    isLoading,
    refreshChatHistory
  };
};
