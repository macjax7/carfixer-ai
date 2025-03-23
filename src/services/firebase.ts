
// This file now redirects to Supabase auth instead of Firebase
import { supabase } from '@/integrations/supabase/client';
import type { UserWithCustomAttributes } from '@/integrations/supabase/client';

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
    // Create a Firebase-compatible user object
    const user = session?.user ? {
      ...session.user,
      displayName: session.user.user_metadata?.name || session.user.email,
      uid: session.user.id
    } : null;
    
    callback(user);
  });
  
  // Return unsubscribe function
  return data.subscription.unsubscribe;
};

// Add missing Firebase-like functions
export const updateUserProfile = async (user: any, profile: { displayName?: string, photoURL?: string }) => {
  const { error } = await supabase.auth.updateUser({
    data: {
      name: profile.displayName,
      avatar_url: profile.photoURL
    }
  });
  
  if (error) throw error;
  return user;
};

// Notification functions
export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    console.warn('This browser does not support notifications');
    return null;
  }
  
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      return 'mock-fcm-token'; // Mock token for compatibility
    }
    return null;
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return null;
  }
};

export const setupMessageListener = (callback: (payload: any) => void) => {
  // This is a stub function for compatibility
  console.log('Setting up mock notification listener');
  return () => {
    console.log('Mock notification listener unsubscribed');
  };
};
