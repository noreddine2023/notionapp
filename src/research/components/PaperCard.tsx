/**
 * Paper Card Component - Displays a paper in search results or library
 */

import React from 'react';
import {
  BookOpen,
  Calendar,
  Quote,
  ExternalLink,
  Plus,
  Check,
  Star,
  StarOff,
  Unlock,
} from 'lucide-react';
import type { Paper } from '../types/paper';
import { useResearchStore } from '../store/researchStore';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface PaperCardProps {
  paper: Paper;
  showLibraryActions?: boolean;
  onClick?: () => void;
}

export const PaperCard: React.FC<PaperCardProps> = ({
  paper,
  showLibraryActions = true,
  onClick,
}) => {
  const {
    addPaperToLibrary,
    removePaperFromLibrary,
    isPaperInLibrary,
    togglePaperFavorite,
    togglePaperRead,
  } = useResearchStore();

  const isInLibrary = isPaperInLibrary(paper.id);

  const handleAddToLibrary = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isInLibrary) {
      removePaperFromLibrary(paper.id);
    } else {
      addPaperToLibrary(paper);
    }
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    togglePaperFavorite(paper.id);
  };

  const handleToggleRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    togglePaperRead(paper.id);
  };

  const truncateAuthors = (authors: Paper['authors'], max: number = 3) => {
    if (authors.length <= max) {
      return authors.map(a => a.name).join(', ');
    }
    return `${authors.slice(0, max).map(a => a.name).join(', ')} +${authors.length - max} more`;
  };

  const truncateAbstract = (abstract: string, maxLength: number = 200) => {
    if (abstract.length <= maxLength) return abstract;
    return abstract.slice(0, maxLength).trim() + '...';
  };

  return (
    <TooltipProvider>
      <Card
        onClick={onClick}
        className={`group cursor-pointer transition-all hover:shadow-lg hover:scale-[1.01] ${
          paper.isRead ? 'opacity-75' : ''
        }`}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              {paper.openAccess && (
                <Badge variant="success" className="gap-1">
                  <Unlock className="w-3 h-3" />
                  Open Access
                </Badge>
              )}
              {paper.year > 0 && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge variant="secondary" className="gap-1">
                      <Calendar className="w-3 h-3" />
                      {paper.year}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Published in {paper.year}</p>
                  </TooltipContent>
                </Tooltip>
              )}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge variant="outline" className="gap-1">
                    <Quote className="w-3 h-3" />
                    {paper.citationCount}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{paper.citationCount} citations</p>
                </TooltipContent>
              </Tooltip>
            </div>
            
            {showLibraryActions && (
              <div className="flex items-center gap-1">
                {isInLibrary && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleToggleFavorite}
                        className={`h-8 w-8 ${
                          paper.isFavorite
                            ? 'text-yellow-500 hover:text-yellow-600'
                            : 'text-muted-foreground'
                        }`}
                      >
                        {paper.isFavorite ? (
                          <Star className="w-4 h-4 fill-current" />
                        ) : (
                          <StarOff className="w-4 h-4" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{paper.isFavorite ? 'Remove from favorites' : 'Add to favorites'}</p>
                    </TooltipContent>
                  </Tooltip>
                )}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={isInLibrary ? "default" : "outline"}
                      size="icon"
                      onClick={handleAddToLibrary}
                      className="h-8 w-8"
                    >
                      {isInLibrary ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Plus className="w-4 h-4" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{isInLibrary ? 'Remove from library' : 'Add to library'}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="pb-3">
          {/* Title */}
          <h3 className="text-base font-semibold mb-2 line-clamp-2 group-hover:text-primary transition-colors">
            {paper.title}
          </h3>

          {/* Authors */}
          <p className="text-sm text-muted-foreground mb-2">
            {truncateAuthors(paper.authors)}
          </p>

          {/* Venue */}
          {paper.venue && (
            <p className="text-sm text-muted-foreground italic mb-2 line-clamp-1">
              {paper.venue}
            </p>
          )}

          {/* Abstract */}
          {paper.abstract && (
            <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
              {truncateAbstract(paper.abstract)}
            </p>
          )}

          {/* Keywords */}
          {paper.keywords.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {paper.keywords.slice(0, 4).map((keyword, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="text-xs"
                >
                  {keyword}
                </Badge>
              ))}
              {paper.keywords.length > 4 && (
                <Badge variant="secondary" className="text-xs">
                  +{paper.keywords.length - 4}
                </Badge>
              )}
            </div>
          )}
        </CardContent>

        <CardFooter className="flex items-center justify-between pt-0">
          <div className="flex items-center gap-2">
            {paper.pdfUrl && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    asChild
                    onClick={(e) => e.stopPropagation()}
                  >
                    <a
                      href={paper.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="gap-1"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      PDF
                    </a>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>View PDF</p>
                </TooltipContent>
              </Tooltip>
            )}
            {paper.doi && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    asChild
                    onClick={(e) => e.stopPropagation()}
                  >
                    <a
                      href={`https://doi.org/${paper.doi}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="gap-1"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      DOI
                    </a>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>View on publisher site</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {isInLibrary && (
              <Button
                variant={paper.isRead ? "default" : "outline"}
                size="sm"
                onClick={handleToggleRead}
              >
                {paper.isRead ? 'Read' : 'Mark as read'}
              </Button>
            )}
            
            <Badge variant="outline" className="text-xs capitalize">
              {paper.source}
            </Badge>
          </div>
        </CardFooter>
      </Card>
    </TooltipProvider>
  );
};
