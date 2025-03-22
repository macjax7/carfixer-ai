
import React from 'react';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';
import { User, Settings, Bell, HelpCircle, LogOut } from 'lucide-react';

const Profile: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header title="Profile" showBackButton={true} />
      
      <main className="container max-w-md mx-auto px-4 py-6 pb-20">
        <div className="flex flex-col items-center mb-8 animate-fade-in">
          <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-4">
            <User className="h-12 w-12 text-muted-foreground" />
          </div>
          
          <h1 className="text-xl font-medium">User</h1>
          <p className="text-muted-foreground">user@example.com</p>
        </div>
        
        <div className="space-y-2 animate-slide-up">
          <button className="w-full flex items-center space-x-3 p-4 rounded-lg bg-white hover:bg-muted/20 transition-colors">
            <Settings className="h-5 w-5 text-muted-foreground" />
            <span>Settings</span>
          </button>
          
          <button className="w-full flex items-center space-x-3 p-4 rounded-lg bg-white hover:bg-muted/20 transition-colors">
            <Bell className="h-5 w-5 text-muted-foreground" />
            <span>Notifications</span>
          </button>
          
          <button className="w-full flex items-center space-x-3 p-4 rounded-lg bg-white hover:bg-muted/20 transition-colors">
            <HelpCircle className="h-5 w-5 text-muted-foreground" />
            <span>Help & Support</span>
          </button>
          
          <button className="w-full flex items-center space-x-3 p-4 mt-6 rounded-lg hover:bg-alert/10 text-alert transition-colors">
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
