
import React, { useRef } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface SidebarSearchProps {
  isSearching: boolean;
  searchQuery: string;
  toggleSearch: () => void;
  handleSearch: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const SidebarSearch = ({ 
  isSearching, 
  searchQuery, 
  toggleSearch, 
  handleSearch 
}: SidebarSearchProps) => {
  const searchInputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      {isSearching ? (
        <div className="flex items-center gap-1 bg-background/90 border rounded-md px-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            ref={searchInputRef}
            value={searchQuery}
            onChange={handleSearch}
            placeholder="Search..."
            className="h-8 w-36 border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
          />
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8" 
            onClick={toggleSearch}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8"
          onClick={toggleSearch}
        >
          <Search className="h-4 w-4" />
        </Button>
      )}
    </>
  );
};

export default SidebarSearch;
