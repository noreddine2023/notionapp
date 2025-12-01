"use client";

import * as React from "react";
import { FileText, Beaker, Clock, MoreVertical } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Badge,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Skeleton,
} from "@/components/ui";
import { cn } from "@/lib/utils";

/**
 * Recent Item Type
 */
interface RecentItem {
  id: string;
  title: string;
  type: "note" | "paper" | "project";
  updatedAt: string;
  preview?: string;
  tags?: string[];
}

/**
 * Mock Data - In production, this would come from server actions
 */
const mockRecentItems: RecentItem[] = [
  {
    id: "1",
    title: "Machine Learning Research Notes",
    type: "note",
    updatedAt: "2 hours ago",
    preview: "Exploring transformer architectures and attention mechanisms...",
    tags: ["ML", "Research"],
  },
  {
    id: "2",
    title: "Attention Is All You Need - Analysis",
    type: "paper",
    updatedAt: "5 hours ago",
    preview: "Key insights from the seminal transformer paper...",
    tags: ["NLP", "Deep Learning"],
  },
  {
    id: "3",
    title: "Weekly Team Standup Notes",
    type: "note",
    updatedAt: "1 day ago",
    preview: "Sprint progress and blockers discussed in today's meeting...",
    tags: ["Team", "Agile"],
  },
  {
    id: "4",
    title: "BERT: Pre-training of Deep Bidirectional Transformers",
    type: "paper",
    updatedAt: "2 days ago",
    preview: "Understanding bidirectional context in language models...",
    tags: ["NLP"],
  },
];

/**
 * Get icon for item type
 */
function getItemIcon(type: RecentItem["type"]) {
  switch (type) {
    case "note":
      return FileText;
    case "paper":
      return Beaker;
    default:
      return FileText;
  }
}

/**
 * Get badge variant for item type
 */
function getTypeVariant(type: RecentItem["type"]): "default" | "secondary" | "outline" {
  switch (type) {
    case "note":
      return "default";
    case "paper":
      return "secondary";
    default:
      return "outline";
  }
}

interface RecentActivityProps {
  isLoading?: boolean;
}

/**
 * Recent Item Card Skeleton
 */
function RecentItemSkeleton() {
  return (
    <div className="flex items-start gap-4 p-4 rounded-lg border bg-card">
      <Skeleton className="h-10 w-10 rounded-lg shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  );
}

/**
 * Recent Activity Component
 * 
 * Architecture Decision: This component displays recently accessed items.
 * In production, this would use React Server Components with Suspense
 * boundaries for data fetching.
 */
export function RecentActivity({ isLoading = false }: RecentActivityProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <RecentItemSkeleton key={i} />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-full lg:col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-muted-foreground" />
          Recent Activity
        </CardTitle>
        <CardDescription>
          Your recently accessed notes and papers
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {mockRecentItems.map((item) => {
          const Icon = getItemIcon(item.type);
          return (
            <div
              key={item.id}
              className="flex items-start gap-4 rounded-lg border bg-card p-4 transition-colors hover:bg-accent/50 cursor-pointer"
            >
              <div
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                  item.type === "note"
                    ? "bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400"
                    : "bg-purple-100 text-purple-600 dark:bg-purple-950 dark:text-purple-400"
                )}
              >
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium truncate">{item.title}</h4>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {item.preview}
                    </p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                        <MoreVertical className="h-4 w-4" />
                        <span className="sr-only">More options</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Open</DropdownMenuItem>
                      <DropdownMenuItem>Share</DropdownMenuItem>
                      <DropdownMenuItem>Add to favorites</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant={getTypeVariant(item.type)} className="capitalize">
                    {item.type}
                  </Badge>
                  {item.tags?.slice(0, 2).map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  <span className="ml-auto text-xs text-muted-foreground">
                    {item.updatedAt}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
