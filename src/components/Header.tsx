
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, Menu, Bell } from 'lucide-react';

interface HeaderProps {
  title?: string;
  showBackButton?: boolean;
  showMenu?: boolean;
  showNotifications?: boolean;
}

const Header: React.FC<HeaderProps> = ({
  title = 'CarFix',
  showBackButton = false,
  showMenu = true,
  showNotifications = true,
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border py-4 px-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {showBackButton && (
            <button
              onClick={handleBack}
              className="p-1 rounded-full hover:bg-secondary transition-colors"
              aria-label="Go back"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          )}
          
          <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
        </div>
        
        <div className="flex items-center space-x-3">
          {showNotifications && (
            <button 
              className="p-1 rounded-full hover:bg-secondary transition-colors"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />
            </button>
          )}
          
          {showMenu && (
            <button 
              className="p-1 rounded-full hover:bg-secondary transition-colors"
              aria-label="Menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
