
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Session } from '@supabase/supabase-js';
import { useToast } from '@/hooks/use-toast';
import type { UserWithCustomAttributes } from '@/integrations/supabase/client';
import { useLocation, useNavigate } from 'react-router-dom';
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';

interface AuthContextType {
  user: UserWithCustomAttributes | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  error: null,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {}
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserWithCustomAttributes | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSessionDialog, setShowSessionDialog] = useState(false);
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();

  // Check if we should preserve the session
  const shouldPreserveSession = location.state?.preserveSession;

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
  }, [shouldPreserveSession]);

  useEffect(() => {
    if (error) {
      toast({
        title: "Authentication Error",
        description: error,
        variant: "destructive"
      });
      setError(null);
    }
  }, [error, toast]);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
    } catch (error) {
      console.error('Sign in error:', error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An unknown error occurred during sign in');
      }
      throw error; // Rethrow to let the Login component handle it
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signUp({
        email,
        password
      });
      
      if (error) throw error;
      
      toast({
        title: "Sign up successful",
        description: "Please check your email to confirm your account"
      });
    } catch (error) {
      console.error('Sign up error:', error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An unknown error occurred during sign up');
      }
      throw error; // Rethrow to let the SignUp component handle it
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast({
        title: "Signed Out",
        description: "You have been signed out successfully"
      });
    } catch (error) {
      console.error('Sign out error:', error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An unknown error occurred during sign out');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSessionKeep = () => {
    setShowSessionDialog(false);
    navigate('/', { replace: true });
    toast({
      title: "Session Preserved",
      description: "Your chat history has been saved to your account."
    });
  };

  const handleSessionDiscard = () => {
    // Clear the guest session
    localStorage.removeItem('carfix_guest_session');
    setShowSessionDialog(false);
    navigate('/', { replace: true });
    toast({
      title: "New Session Started",
      description: "You're starting with a fresh chat."
    });
  };

  const value = {
    user,
    session,
    loading,
    error,
    signIn,
    signUp,
    signOut
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
      
      {/* Session preservation dialog */}
      <AlertDialog open={showSessionDialog} onOpenChange={setShowSessionDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Save your chat session?</AlertDialogTitle>
            <AlertDialogDescription>
              Would you like to save your current chat session and continue where you left off?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button variant="outline" onClick={handleSessionDiscard}>
              Start Fresh
            </Button>
            <Button onClick={handleSessionKeep}>
              Save Session
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AuthContext.Provider>
  );
};
