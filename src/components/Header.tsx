
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, UserPlus } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import ProfileMenu from '@/components/ProfileMenu';

interface HeaderProps {
  title?: string;
  showBackButton?: boolean;
  showMenu?: boolean;
  showNotifications?: boolean;
}

const Header: React.FC<HeaderProps> = ({
  title = 'CarFix',
  showBackButton = false,
  showMenu = false,
  showNotifications = false,
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleLogin = () => {
    navigate('/login');
  };

  const handleSignUp = () => {
    navigate('/signup');
  };

  return (
    <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border py-4 px-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
        </div>
        
        <div className="flex items-center space-x-3">
          {user ? (
            <ProfileMenu />
          ) : (
            <>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleLogin}
                className="font-medium"
              >
                Log in
              </Button>
              
              <Button 
                variant="default" 
                size="sm"
                onClick={handleSignUp}
                className="font-medium"
              >
                Sign up
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
