
import React from 'react';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { Link } from "react-router-dom";
import { Logo } from './Logo';

export const MobileNav = () => {
  return (
    <div className="flex md:hidden flex-1 justify-between">
      <Link to="/" className="flex items-center">
        <Logo />
      </Link>
      
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </SheetTrigger>
        
        <SheetContent side="left" className="pr-0">
          <div className="px-7">
            <Logo />
          </div>
          
          <div className="mt-8 flex flex-col gap-4">
            <Link 
              to="/" 
              className="flex items-center gap-2 px-7 py-2 text-lg font-semibold"
            >
              Home
            </Link>
            <Link 
              to="/dashboard" 
              className="flex items-center gap-2 px-7 py-2 text-lg font-semibold"
            >
              Dashboard
            </Link>
            <Link 
              to="/chat" 
              className="flex items-center gap-2 px-7 py-2 text-lg font-semibold"
            >
              Chat
            </Link>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};
