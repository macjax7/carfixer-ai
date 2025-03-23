import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronRight, Clock, MessageSquare } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';
import { ChatHistoryItem } from './useSidebarState';

interface SidebarChatHistoryProps {
  chatHistoryOpen: boolean;
  setChatHistoryOpen: (open: boolean) => void;
  chatHistory: ChatHistoryItem[];
}

const SidebarChatHistory = ({
  chatHistoryOpen,
  setChatHistoryOpen,
  chatHistory
}: SidebarChatHistoryProps) => {
  return (
    <SidebarGroup className="mt-4 pt-2 border-t border-border">
      <Collapsible
        open={chatHistoryOpen}
        onOpenChange={setChatHistoryOpen}
        className="w-full"
      >
        <CollapsibleTrigger asChild>
          <button className="flex items-center w-full p-2 text-sm font-medium hover:bg-sidebar-accent rounded-md transition-colors">
            <span className="flex-1 flex items-center">
              {chatHistoryOpen ? 
                <ChevronDown className="h-4 w-4 mr-2 text-muted-foreground" /> : 
                <ChevronRight className="h-4 w-4 mr-2 text-muted-foreground" />}
              Chat History
            </span>
          </button>
        </CollapsibleTrigger>
        
        <CollapsibleContent className="transition-all duration-200 ease-in-out">
          <SidebarGroupContent>
            <SidebarMenu>
              {chatHistory.map((chat) => (
                <SidebarMenuItem key={chat.id}>
                  <SidebarMenuButton asChild className="block w-full px-2 py-2">
                    <Link to={chat.path} className="w-full">
                      <div className="flex flex-col w-full">
                        <span className="text-base font-normal truncate text-sidebar-foreground">{chat.title}</span>
                        <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                          <Clock className="h-3 w-3 flex-shrink-0" />
                          <span className="truncate">{chat.timestamp}</span>
                        </div>
                      </div>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </CollapsibleContent>
      </Collapsible>
    </SidebarGroup>
  );
};

export default SidebarChatHistory;
