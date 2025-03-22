
import React from 'react';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';
import { User, Settings, Bell, HelpCircle, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { signOut } from '../services/firebase';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

const Profile: React.FC = () => {
  const { user } = useAuth();
  const { notificationsEnabled, toggleNotifications, requestPermission } = useNotifications();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed Out",
        description: "You have been signed out successfully"
      });
      navigate('/login');
    } catch (error) {
      console.error('Sign out error:', error);
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleToggleNotifications = () => {
    if (!notificationsEnabled) {
      // If enabling notifications, request permission
      requestPermission();
    } else {
      // Just toggle the state if disabling
      toggleNotifications();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header title="Profile" showBackButton={true} />
      
      <main className="container max-w-md mx-auto px-4 py-6 pb-20">
        <div className="flex flex-col items-center mb-8 animate-fade-in">
          <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-4">
            {user?.photoURL ? (
              <img 
                src={user.photoURL} 
                alt={user.displayName || "User"} 
                className="w-24 h-24 rounded-full object-cover"
              />
            ) : (
              <User className="h-12 w-12 text-muted-foreground" />
            )}
          </div>
          
          <h1 className="text-xl font-medium">{user?.displayName || "User"}</h1>
          <p className="text-muted-foreground">{user?.email}</p>
        </div>
        
        <div className="space-y-2 animate-slide-up">
          <button className="w-full flex items-center space-x-3 p-4 rounded-lg bg-white hover:bg-muted/20 transition-colors">
            <Settings className="h-5 w-5 text-muted-foreground" />
            <span>Settings</span>
          </button>
          
          <div className="w-full flex items-center justify-between p-4 rounded-lg bg-white">
            <div className="flex items-center space-x-3">
              <Bell className="h-5 w-5 text-muted-foreground" />
              <span>Notifications</span>
            </div>
            <Switch
              checked={notificationsEnabled}
              onCheckedChange={handleToggleNotifications}
              aria-label="Toggle notifications"
            />
          </div>
          
          <button className="w-full flex items-center space-x-3 p-4 rounded-lg bg-white hover:bg-muted/20 transition-colors">
            <HelpCircle className="h-5 w-5 text-muted-foreground" />
            <span>Help & Support</span>
          </button>
          
          <button 
            className="w-full flex items-center space-x-3 p-4 mt-6 rounded-lg hover:bg-alert/10 text-alert transition-colors"
            onClick={handleSignOut}
          >
            <LogOut className="h-5 w-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </main>
      
      <BottomNav />
    </div>
  );
};

export default Profile;
