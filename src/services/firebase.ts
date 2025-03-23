
// This file now redirects to Supabase auth instead of Firebase
import { supabase } from '@/integrations/supabase/client';

// Redirecting Firebase auth functions to Supabase
export const signUp = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  
  if (error) throw error;
  return data;
};

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  if (error) throw error;
  return data;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const onAuthChange = (callback: (user: any) => void) => {
  // Subscribe to auth changes
  const { data } = supabase.auth.onAuthStateChange((event, session) => {
    callback(session?.user || null);
  });
  
  // Return unsubscribe function
  return data.subscription.unsubscribe;
};
