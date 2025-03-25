import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import ProfileMenu from '@/components/ProfileMenu';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Menu } from 'lucide-react';
import { MobileNav } from './MobileNav';
import { ModeToggle } from './ModeToggle';
import { Logo } from './Logo';

const Header = () => {
  const { user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-40 w-full bg-background/90 backdrop-blur-sm border-b">
      <div className="container flex h-16 items-center px-4 sm:px-6">
        <div className="mr-4 hidden md:flex">
          <Link to="/" className="flex items-center space-x-2 mr-6">
            <Logo />
          </Link>
          
          <nav className="flex items-center space-x-4 lg:space-x-6">
            <Link to="/" className="text-sm font-medium transition-colors hover:text-primary">
              Home
            </Link>
            
            {/* Add Dashboard Link */}
            <Link to="/dashboard" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
              Dashboard
            </Link>
            
          </nav>
        </div>
        
        <MobileNav />
      </div>
    </header>
  );
};

export default Header;
