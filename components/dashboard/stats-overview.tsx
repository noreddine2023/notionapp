"use client";

import * as React from "react";
import {
  FileText,
  FolderKanban,
  TrendingUp,
  Clock,
  Users,
  Beaker,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, Skeleton } from "@/components/ui";
import { cn } from "@/lib/utils";

/**
 * Stat Card Data Type
 */
interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: React.ElementType;
  trend?: {
    value: number;
    label: string;
  };
  className?: string;
}

/**
 * Stat Card Component
 * 
 * Architecture Decision: Cards use CSS Grid for layout and CSS variables
 * for theming. The glassmorphism effect can be applied with the 'glass' class.
 */
function StatCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  className,
}: StatCardProps) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="rounded-md bg-primary/10 p-2">
          <Icon className="h-4 w-4 text-primary" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
        {trend && (
          <div className="mt-2 flex items-center gap-1 text-xs">
            <TrendingUp
              className={cn(
                "h-3 w-3",
                trend.value >= 0 ? "text-green-500" : "text-red-500"
              )}
            />
            <span
              className={cn(
                "font-medium",
                trend.value >= 0 ? "text-green-500" : "text-red-500"
              )}
            >
              {trend.value >= 0 ? "+" : ""}
              {trend.value}%
            </span>
            <span className="text-muted-foreground">{trend.label}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Stat Card Skeleton for Loading State
 */
function StatCardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-8 rounded-md" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-20 mb-2" />
        <Skeleton className="h-3 w-32" />
      </CardContent>
    </Card>
  );
}

/**
 * Stats Overview Props
 */
interface StatsOverviewProps {
  isLoading?: boolean;
}

/**
 * Stats Overview Component
 * 
 * Displays key metrics in a responsive Bento Box grid layout.
 */
export function StatsOverview({ isLoading = false }: StatsOverviewProps) {
  const stats: StatCardProps[] = [
    {
      title: "Total Notes",
      value: "128",
      description: "Active documents",
      icon: FileText,
      trend: { value: 12, label: "from last month" },
    },
    {
      title: "Research Papers",
      value: "47",
      description: "Saved to library",
      icon: Beaker,
      trend: { value: 8, label: "this week" },
    },
    {
      title: "Active Projects",
      value: "12",
      description: "In progress",
      icon: FolderKanban,
      trend: { value: 3, label: "new this month" },
    },
    {
      title: "Team Members",
      value: "8",
      description: "Collaborators",
      icon: Users,
    },
  ];

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <StatCard key={index} {...stat} />
      ))}
    </div>
  );
}
