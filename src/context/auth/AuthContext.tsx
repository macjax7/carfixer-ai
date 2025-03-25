
import React, { createContext, useContext, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import type { UserWithCustomAttributes } from '@/integrations/supabase/client';
import { useAuthMethods } from './useAuthMethods';
import { useAuthEffects } from './useAuthEffects';
import { useSessionDialog } from './useSessionDialog';
import { AuthContextType } from './types';

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
  
  const { 
    loading, 
    error, 
    setError,
    setLoading,
    signIn, 
    signUp, 
    signOut 
  } = useAuthMethods();
  
  const { 
    showSessionDialog, 
    setShowSessionDialog, 
    SessionDialog 
  } = useSessionDialog();
  
  // Set up auth effects
  useAuthEffects(setUser, setSession, setLoading, setError, setShowSessionDialog);

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
      <SessionDialog />
    </AuthContext.Provider>
  );
};
