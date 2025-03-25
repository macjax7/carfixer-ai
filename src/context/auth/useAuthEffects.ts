
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import type { UserWithCustomAttributes } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function useAuthEffects(
  setUser: React.Dispatch<React.SetStateAction<UserWithCustomAttributes | null>>,
  setSession: React.Dispatch<React.SetStateAction<import('@supabase/supabase-js').Session | null>>,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>,
  setError: React.Dispatch<React.SetStateAction<string | null>>,
  setShowSessionDialog: React.Dispatch<React.SetStateAction<boolean>>
) {
  const location = useLocation();
  const { toast } = useToast();
  
  // Check if we should preserve the session
  const shouldPreserveSession = location.state?.preserveSession;

  // Effect for auth state changes
  useEffect(() => {
    // First, set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        console.log("Auth state changed:", event, currentSession?.user?.email);
        
        // Show dialog when user logs in with preserve session flag
        if (event === 'SIGNED_IN' && shouldPreserveSession && 
            localStorage.getItem('carfix_guest_session')) {
          setShowSessionDialog(true);
        }
        
        setSession(currentSession);
        if (currentSession?.user) {
          // Create a modified user object with displayName and uid for Firebase compatibility
          const extendedUser: UserWithCustomAttributes = {
            ...currentSession.user,
            displayName: currentSession.user.user_metadata?.name || currentSession.user.email,
            uid: currentSession.user.id
          };
          setUser(extendedUser);
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );

    // Then check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      console.log("Initial session check:", currentSession?.user?.email);
      setSession(currentSession);
      if (currentSession?.user) {
        // Create a modified user object with displayName and uid for Firebase compatibility
        const extendedUser: UserWithCustomAttributes = {
          ...currentSession.user,
          displayName: currentSession.user.user_metadata?.name || currentSession.user.email,
          uid: currentSession.user.id
        };
        setUser(extendedUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    // Cleanup subscription
    return () => {
      subscription.unsubscribe();
    };
  }, [shouldPreserveSession, setUser, setSession, setLoading, setShowSessionDialog]);

  // Effect for displaying errors
  useEffect(() => {
    if (setError) {
      // This effect is specifically for handling changes to the error state
      // which would be managed outside this hook
    }
  }, [setError]);

  return { shouldPreserveSession };
}
