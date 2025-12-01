/**
 * Paper Library Component - View and manage saved papers
 */

import React, { useState } from 'react';
import {
  Search,
  Star,
  BookOpen,
  Filter,
  X,
  Library,
  Grid,
  List,
} from 'lucide-react';
import { PaperCard } from './PaperCard';
import { useResearchStore } from '../store/researchStore';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

type ViewMode = 'grid' | 'list';

export const PaperLibrary: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [searchQuery, setSearchQuery] = useState('');

  const {
    papers,
    libraryFilter,
    setLibraryFilter,
    getFilteredLibraryPapers,
    setCurrentView,
    setSelectedPaper,
    setSearchQuery: setStoreSearchQuery,
  } = useResearchStore();

  // Apply local search filter
  const filteredPapers = React.useMemo(() => {
    let filtered = getFilteredLibraryPapers();
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.title.toLowerCase().includes(query) ||
        p.authors.some(a => a.name.toLowerCase().includes(query)) ||
        p.abstract.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  }, [getFilteredLibraryPapers, searchQuery]);

  const handlePaperClick = (paperId: string) => {
    setSelectedPaper(paperId);
    setCurrentView('paper-detail');
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setStoreSearchQuery(e.target.value);
  };

  const stats = {
    total: papers.length,
    favorites: papers.filter(p => p.isFavorite).length,
    unread: papers.filter(p => !p.isRead).length,
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Library className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">My Library</h2>
          </div>
          
          <div className="flex items-center gap-1">
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="icon"
              onClick={() => setViewMode('list')}
            >
              <List className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="icon"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search your library..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="pl-9 pr-9"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setSearchQuery('');
                setStoreSearchQuery('');
              }}
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
            >
              <X className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>

        {/* Filter tabs */}
        <div className="flex items-center gap-2">
          <Button
            variant={libraryFilter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setLibraryFilter('all')}
            className="gap-1.5"
          >
            <Filter className="w-3.5 h-3.5" />
            All
            <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-xs">
              {stats.total}
            </Badge>
          </Button>
          <Button
            variant={libraryFilter === 'favorites' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setLibraryFilter('favorites')}
            className="gap-1.5"
          >
            <Star className="w-3.5 h-3.5" />
            Favorites
            <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-xs">
              {stats.favorites}
            </Badge>
          </Button>
          <Button
            variant={libraryFilter === 'unread' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setLibraryFilter('unread')}
            className="gap-1.5"
          >
            <BookOpen className="w-3.5 h-3.5" />
            Unread
            <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-xs">
              {stats.unread}
            </Badge>
          </Button>
        </div>
      </div>

      {/* Papers list */}
      <ScrollArea className="flex-1">
        <div className="p-4">
          {papers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Library className="w-12 h-12 text-muted-foreground/50 mb-3" />
              <p className="text-sm font-medium mb-1">Your library is empty</p>
              <p className="text-xs text-muted-foreground">
                Search for papers and add them to your library
              </p>
            </div>
          ) : filteredPapers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Search className="w-12 h-12 text-muted-foreground/50 mb-3" />
              <p className="text-sm font-medium mb-1">No papers match your filters</p>
              <p className="text-xs text-muted-foreground">
                Try different search terms or filters
              </p>
            </div>
          ) : (
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 gap-3' : 'space-y-3'}>
              {filteredPapers.map((paper) => (
                <PaperCard
                  key={paper.id}
                  paper={paper}
                  onClick={() => handlePaperClick(paper.id)}
                />
              ))}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
