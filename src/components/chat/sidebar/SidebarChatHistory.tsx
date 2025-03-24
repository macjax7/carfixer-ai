
import React from 'react';
import { CollapsibleContent } from '@/components/ui/collapsible';
import { NavLink } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { ChatHistoryItem } from '@/hooks/chat/sidebar/types';
import { cn } from '@/lib/utils';

interface SidebarChatHistoryProps {
  chatHistory: ChatHistoryItem[];
  isLoading: boolean;
}

const SidebarChatHistory: React.FC<SidebarChatHistoryProps> = ({
  chatHistory,
  isLoading
}) => {
  return (
    <CollapsibleContent className="px-1 py-2">
      {isLoading ? (
        <div className="flex justify-center py-4">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : chatHistory.length > 0 ? (
        <ul className="space-y-1">
          {chatHistory.map((item) => (
            <li key={item.id}>
              <NavLink
                to={`/chat/${item.id}`}
                className={({ isActive }) =>
                  cn(
                    "flex items-center rounded-md py-2 px-3 text-sm w-full",
                    "hover:bg-accent/50 transition-colors",
                    isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground"
                  )
                }
              >
                <div className="flex-1 overflow-hidden">
                  <p className="truncate">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.timestamp}</p>
                </div>
              </NavLink>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-center text-muted-foreground py-3">No chat history found</p>
      )}
    </CollapsibleContent>
  );
};

export default SidebarChatHistory;
