
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { nanoid } from 'nanoid';

export const useAuthState = () => {
  const [chatId, setChatId] = useState<string | null>(null);
  const { user } = useAuth();

  // Initialize chat session based on authentication state
  useEffect(() => {
    let isMounted = true;
    
    const initializeSession = async () => {
      try {
        const { data: session } = await supabase.auth.getSession();
        
        // If not logged in and no chat ID yet, generate one
        if (!session.session?.user && !chatId && isMounted) {
          setChatId(nanoid());
        }
      } catch (error) {
        console.error("Error initializing auth state:", error);
        if (isMounted) {
          setChatId(nanoid()); // Fallback to a new chat ID
        }
      }
    };

    if (!chatId) {
      initializeSession();
    }
    
    return () => {
      isMounted = false;
    };
  }, [chatId, user]);

  return {
    chatId,
    setChatId,
    user
  };
};
