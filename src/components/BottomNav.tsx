
import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, MessageCircle, Scan, Car, User } from 'lucide-react';

const BottomNav: React.FC = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-10 bg-background/90 backdrop-blur-md border-t border-border py-1">
      <div className="flex items-center justify-around">
        <NavLink 
          to="/" 
          end
          className={({ isActive }) => 
            `bottom-nav-item ${isActive ? 'active' : ''}`
          }
        >
          <Home className="h-5 w-5 mb-1" />
          <span>Home</span>
        </NavLink>
        
        <NavLink 
          to="/chat" 
          className={({ isActive }) => 
            `bottom-nav-item ${isActive ? 'active' : ''}`
          }
        >
          <MessageCircle className="h-5 w-5 mb-1" />
          <span>Chat</span>
        </NavLink>
        
        <NavLink 
          to="/scan" 
          className={({ isActive }) => 
            `bottom-nav-item ${isActive ? 'active' : ''}`
          }
        >
          <Scan className="h-5 w-5 mb-1" />
          <span>Scan</span>
        </NavLink>
        
        <NavLink 
          to="/vehicles" 
          className={({ isActive }) => 
            `bottom-nav-item ${isActive ? 'active' : ''}`
          }
        >
          <Car className="h-5 w-5 mb-1" />
          <span>Vehicles</span>
        </NavLink>
        
        <NavLink 
          to="/profile" 
          className={({ isActive }) => 
            `bottom-nav-item ${isActive ? 'active' : ''}`
          }
        >
          <User className="h-5 w-5 mb-1" />
          <span>Profile</span>
        </NavLink>
      </div>
    </nav>
  );
};

export default BottomNav;
