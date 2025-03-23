
import React from 'react';
import { SidebarFooter as UISidebarFooter } from '@/components/ui/sidebar';

interface SidebarFooterProps {
  user: {
    email?: string;
  } | null;
}

const SidebarFooterComponent: React.FC<SidebarFooterProps> = ({ user }) => {
  return (
    <UISidebarFooter className="border-t p-4">
      {user && (
        <div className="flex items-center">
          <div className="truncate">
            <p className="text-sm font-medium text-muted-foreground truncate">{user.email || 'User'}</p>
          </div>
        </div>
      )}
    </UISidebarFooter>
  );
};

export default SidebarFooterComponent;
