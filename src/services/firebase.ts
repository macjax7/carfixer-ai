
import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
  User
} from "firebase/auth";
import { 
  getMessaging, 
  getToken, 
  onMessage 
} from "firebase/messaging";
import { firebaseConfig } from "../config/firebase";

// Initialize Firebase - fix the app initialization to prevent duplicate app errors
let app;
try {
  app = initializeApp(firebaseConfig);
} catch (error: any) {
  if (error.code !== 'app/duplicate-app') {
    throw error;
  }
  // If we already have an app instance, use the existing one
  app = initializeApp();
}

export const auth = getAuth(app);

// Initialize Firebase Cloud Messaging
let messaging: any;
try {
  messaging = getMessaging(app);
} catch (error) {
  console.error("Firebase messaging failed to initialize:", error);
}

// Authentication functions
export const signUp = async (email: string, password: string) => {
  return createUserWithEmailAndPassword(auth, email, password);
};

export const signIn = async (email: string, password: string) => {
  return signInWithEmailAndPassword(auth, email, password);
};

export const signOut = async () => {
  return firebaseSignOut(auth);
};

export const updateUserProfile = async (user: User, data: any) => {
  return updateProfile(user, data);
};

// Notifications functions
export const requestNotificationPermission = async () => {
  if (!messaging) return null;
  
  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.log('Notification permission denied');
      return null;
    }
    
    // Get registration token for FCM
    const token = await getToken(messaging, {
      vapidKey: 'BEuO-zZiit_zQExDQoSSuOHc0KHp5fHS0Ge16PkDY2DQ-kFc25dKGrQWgGR3liSEg8tAFPXYlVXwBoD7NgjZaUQ'
    });
    
    return token;
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return null;
  }
};

// Listen for FCM messages when app is in foreground
export const setupMessageListener = (callback: (payload: any) => void) => {
  if (!messaging) return () => {};
  
  return onMessage(messaging, (payload) => {
    callback(payload);
  });
};

// Listen for auth state changes
export const onAuthChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};
