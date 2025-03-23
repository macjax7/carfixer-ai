
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useToast } from '@/hooks/use-toast';
import { requestNotificationPermission, setupMessageListener } from '../services/firebase';

interface NotificationContextType {
  hasPermission: boolean;
  requestPermission: () => Promise<void>;
  notificationsEnabled: boolean;
  toggleNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType>({
  hasPermission: false,
  requestPermission: async () => {},
  notificationsEnabled: false,
  toggleNotifications: () => {},
});

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [hasPermission, setHasPermission] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    () => localStorage.getItem('notificationsEnabled') === 'true'
  );
  const { user } = useAuth();
  const { toast } = useToast();

  // Check if browser supports notifications
  const notificationsSupported = 'Notification' in window;

  useEffect(() => {
    // Check initial permission state
    if (notificationsSupported && Notification.permission === 'granted') {
      setHasPermission(true);
    }
  }, [notificationsSupported]);

  useEffect(() => {
    // Save notification preference
    localStorage.setItem('notificationsEnabled', notificationsEnabled.toString());
    
    // If user is logged in and notifications are enabled, get token
    if (user && notificationsEnabled && notificationsSupported) {
      requestPermission();
    }
  }, [user, notificationsEnabled, notificationsSupported]);

  // Setup message listener for foreground notifications
  useEffect(() => {
    if (!notificationsEnabled) return;
    
    const unsubscribe = setupMessageListener((payload) => {
      const { notification } = payload;
      
      if (notification) {
        toast({
          title: notification.title,
          description: notification.body,
        });
      }
    });
    
    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [notificationsEnabled, toast]);

  const requestPermission = async () => {
    if (!notificationsSupported) {
      toast({
        title: "Notifications Not Supported",
        description: "Your browser doesn't support notifications.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const fcmToken = await requestNotificationPermission();
      
      if (fcmToken) {
        setToken(fcmToken);
        setHasPermission(true);
        
        // Here you would send the token to your backend
        console.log('FCM Token:', fcmToken);
        
        toast({
          title: "Notifications Enabled",
          description: "You'll receive notifications for important updates."
        });
      } else {
        setHasPermission(false);
        
        toast({
          title: "Notification Permission Denied",
          description: "Please enable notifications in your browser settings.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      
      toast({
        title: "Notification Error",
        description: "Failed to set up notifications.",
        variant: "destructive"
      });
    }
  };

  const toggleNotifications = () => {
    setNotificationsEnabled(prev => !prev);
  };

  const value = {
    hasPermission,
    requestPermission,
    notificationsEnabled,
    toggleNotifications
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
