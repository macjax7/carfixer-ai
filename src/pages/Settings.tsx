
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Settings as SettingsIcon, 
  Bell, 
  Car, 
  Mic, 
  Shield, 
  MessageSquare, 
  HelpCircle, 
  Key,
  Sun,
  Moon,
  Laptop,
  X,
  Database,
  Languages,
  GaugeCircle,
  Smartphone
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from '@/context/AuthContext';
import { useVehicles } from '@/hooks/use-vehicles';
import { useNotifications } from '@/context/NotificationContext';
import ChatSidebar from '@/components/chat/ChatSidebar';
import { SidebarProvider } from '@/components/ui/sidebar';

// Settings page layout inspired by ChatGPT
const Settings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { vehicles } = useVehicles();
  const { notificationsEnabled, toggleNotifications } = useNotifications();
  
  // Theme state
  const [theme, setTheme] = useState<'system' | 'light' | 'dark'>('system');
  
  // Other settings states
  const [defaultVehicle, setDefaultVehicle] = useState(vehicles && vehicles.length > 0 ? vehicles[0]?.id : '');
  const [units, setUnits] = useState<'imperial' | 'metric'>('imperial');
  const [language, setLanguage] = useState('auto');
  
  // Notification settings
  const [maintenanceReminders, setMaintenanceReminders] = useState(true);
  const [diagnosticAlerts, setDiagnosticAlerts] = useState(true);
  const [appUpdates, setAppUpdates] = useState(true);
  
  // Speech settings
  const [voiceInteraction, setVoiceInteraction] = useState(false);
  const [readAloud, setReadAloud] = useState(false);
  
  // Security settings
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);

  // Selected settings section
  const [selectedSection, setSelectedSection] = useState('general');

  const handleClose = () => {
    navigate(-1);
  };

  const clearVehicleData = () => {
    toast({
      title: "Data Cleared",
      description: "Your vehicle data has been successfully cleared."
    });
  };

  const clearChatHistory = () => {
    toast({
      title: "Chat History Cleared",
      description: "Your chat history has been successfully deleted."
    });
  };

  const sections = [
    { id: 'general', label: 'General', icon: <SettingsIcon className="w-5 h-5" /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell className="w-5 h-5" /> },
    { id: 'vehicle', label: 'Vehicle Management', icon: <Car className="w-5 h-5" /> },
    { id: 'speech', label: 'Speech & Interaction', icon: <Mic className="w-5 h-5" /> },
    { id: 'privacy', label: 'Privacy & Data Controls', icon: <Database className="w-5 h-5" /> },
    { id: 'chat', label: 'Chat & History', icon: <MessageSquare className="w-5 h-5" /> },
    { id: 'help', label: 'Help & Support', icon: <HelpCircle className="w-5 h-5" /> },
    { id: 'security', label: 'Account & Security', icon: <Key className="w-5 h-5" /> },
  ];

  const renderThemeOption = (value: string, label: string, icon: React.ReactNode) => (
    <div 
      className={`flex items-center gap-2 p-2 cursor-pointer rounded-md hover:bg-accent ${theme === value ? 'bg-accent text-accent-foreground' : ''}`}
      onClick={() => setTheme(value as 'system' | 'light' | 'dark')}
    >
      {icon}
      <span>{label}</span>
    </div>
  );

  const renderContent = () => {
    switch (selectedSection) {
      case 'general':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium">Theme</h3>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {renderThemeOption('system', 'System', <Laptop className="w-5 h-5" />)}
                {renderThemeOption('light', 'Light', <Sun className="w-5 h-5" />)}
                {renderThemeOption('dark', 'Dark', <Moon className="w-5 h-5" />)}
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium">Default Vehicle</h3>
              <div className="mt-2">
                <Select 
                  value={defaultVehicle} 
                  onValueChange={setDefaultVehicle}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a vehicle" />
                  </SelectTrigger>
                  <SelectContent>
                    {vehicles && vehicles.map(vehicle => (
                      <SelectItem key={vehicle.id} value={vehicle.id}>
                        {vehicle.make} {vehicle.model} ({vehicle.year})
                      </SelectItem>
                    ))}
                    {(!vehicles || vehicles.length === 0) && (
                      <SelectItem value="no-vehicles">No vehicles available</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium">Units</h3>
              <div className="mt-2">
                <Select 
                  value={units} 
                  onValueChange={(value) => setUnits(value as 'imperial' | 'metric')}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select units" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="imperial">Imperial (mph, mi)</SelectItem>
                    <SelectItem value="metric">Metric (km/h, km)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium">Language</h3>
              <div className="mt-2">
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">Auto-detect</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                    <SelectItem value="de">German</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );
      
      case 'notifications':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <h3 className="text-lg font-medium">Maintenance Reminders</h3>
                <p className="text-sm text-muted-foreground">Get notifications about routine maintenance for your vehicles</p>
              </div>
              <Switch 
                checked={maintenanceReminders} 
                onCheckedChange={setMaintenanceReminders} 
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <h3 className="text-lg font-medium">Diagnostic Alerts</h3>
                <p className="text-sm text-muted-foreground">Receive alerts when diagnostic issues are detected</p>
              </div>
              <Switch 
                checked={diagnosticAlerts} 
                onCheckedChange={setDiagnosticAlerts} 
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <h3 className="text-lg font-medium">App Updates</h3>
                <p className="text-sm text-muted-foreground">Get notifications about new features and updates</p>
              </div>
              <Switch 
                checked={appUpdates} 
                onCheckedChange={setAppUpdates} 
              />
            </div>
          </div>
        );
      
      case 'vehicle':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium">Manage Vehicles</h3>
              <p className="text-sm text-muted-foreground">Add, edit, or remove your vehicles</p>
              <Button variant="outline" className="mt-2" onClick={() => navigate('/vehicles')}>
                <Car className="mr-2 h-4 w-4" />
                View Vehicles
              </Button>
            </div>
            
            <Separator />
            
            <div>
              <h3 className="text-lg font-medium">Connected OBD-II Devices</h3>
              <p className="text-sm text-muted-foreground">Manage your paired diagnostic devices</p>
              <div className="mt-4 p-4 border rounded-md bg-muted/30">
                <p className="text-center text-sm text-muted-foreground">No devices connected</p>
                <Button variant="outline" className="w-full mt-2">
                  <GaugeCircle className="mr-2 h-4 w-4" />
                  Add New Device
                </Button>
              </div>
            </div>
          </div>
        );
      
      case 'speech':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <h3 className="text-lg font-medium">Voice Interaction</h3>
                <p className="text-sm text-muted-foreground">Use voice commands to interact with CarFix AI</p>
              </div>
              <Switch 
                checked={voiceInteraction} 
                onCheckedChange={setVoiceInteraction} 
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <h3 className="text-lg font-medium">Read Aloud Responses</h3>
                <p className="text-sm text-muted-foreground">Have CarFix AI read responses aloud</p>
              </div>
              <Switch 
                checked={readAloud} 
                onCheckedChange={setReadAloud} 
              />
            </div>
          </div>
        );
      
      case 'privacy':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium">Clear Vehicle Data</h3>
              <p className="text-sm text-muted-foreground">Remove all stored data about your vehicles</p>
              <Button variant="destructive" className="mt-2" onClick={clearVehicleData}>
                Clear Data
              </Button>
            </div>
            
            <Separator />
            
            <div>
              <h3 className="text-lg font-medium">Manage Data Sharing</h3>
              <p className="text-sm text-muted-foreground">Control how your data is shared with third parties</p>
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Share diagnostic data</span>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Share usage analytics</span>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Allow personalized recommendations</span>
                  <Switch defaultChecked />
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'chat':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium">Archived Chats</h3>
              <p className="text-sm text-muted-foreground">View and manage your archived conversations</p>
              <Button variant="outline" className="mt-2">
                Manage Archives
              </Button>
            </div>
            
            <Separator />
            
            <div>
              <h3 className="text-lg font-medium">Delete Chat History</h3>
              <p className="text-sm text-muted-foreground">Permanently delete all your chat history</p>
              <Button variant="destructive" className="mt-2" onClick={clearChatHistory}>
                Delete All Chats
              </Button>
            </div>
          </div>
        );
      
      case 'help':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium">User Guide</h3>
              <p className="text-sm text-muted-foreground">Learn how to use CarFix AI effectively</p>
              <Button variant="outline" className="mt-2">
                View Guide
              </Button>
            </div>
            
            <Separator />
            
            <div>
              <h3 className="text-lg font-medium">Contact Support</h3>
              <p className="text-sm text-muted-foreground">Get help with any issues or questions</p>
              <Button variant="outline" className="mt-2">
                Contact Us
              </Button>
            </div>
          </div>
        );
      
      case 'security':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium">Update Password</h3>
              <p className="text-sm text-muted-foreground">Change your account password</p>
              <Button variant="outline" className="mt-2">
                Update Password
              </Button>
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <h3 className="text-lg font-medium">Two-Factor Authentication</h3>
                <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
              </div>
              <Switch 
                checked={twoFactorAuth} 
                onCheckedChange={setTwoFactorAuth} 
              />
            </div>
            
            <Separator />
            
            <div>
              <h3 className="text-lg font-medium">Device Management</h3>
              <p className="text-sm text-muted-foreground">View and manage your active sessions</p>
              <div className="mt-4 space-y-2">
                <div className="p-3 border rounded-md flex justify-between items-center">
                  <div>
                    <p className="font-medium">Current Device</p>
                    <p className="text-xs text-muted-foreground">Chrome on macOS · Active now</p>
                  </div>
                  <Smartphone className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            </div>
          </div>
        );
      
      default:
        return <div>Select a section</div>;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Pass defaultOpen={undefined} to SidebarProvider to maintain current sidebar state */}
      <SidebarProvider defaultOpen={undefined}>
        <ChatSidebar />
        <div className="flex-1 overflow-auto">
          <div className="max-w-3xl mx-auto p-4 md:p-6">
            <div className="bg-card shadow-md rounded-lg border">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-xl font-semibold">Settings</h2>
                <Button variant="ghost" size="icon" onClick={handleClose}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
              
              <div className="flex flex-col md:flex-row h-full">
                {/* Sidebar */}
                <div className="w-full md:w-64 p-2 md:border-r">
                  <div className="space-y-1">
                    {sections.map((section) => (
                      <Button
                        key={section.id}
                        variant={selectedSection === section.id ? "secondary" : "ghost"}
                        className="w-full justify-start"
                        onClick={() => setSelectedSection(section.id)}
                      >
                        <div className="mr-2">{section.icon}</div>
                        <span>{section.label}</span>
                      </Button>
                    ))}
                  </div>
                </div>
                
                {/* Content */}
                <div className="flex-1 p-4 md:p-6 overflow-auto">
                  {renderContent()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </SidebarProvider>
    </div>
  );
};

export default Settings;
