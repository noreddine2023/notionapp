import { Skeleton } from "@/components/ui";

/**
 * Loading Component
 * 
 * Architecture Decision: This loading state is shown while the dashboard
 * content is being fetched. Using skeleton loaders provides a better
 * perceived performance than spinners.
 */
export default function Loading() {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar Skeleton */}
      <div className="hidden lg:block w-64 border-r bg-sidebar p-4 space-y-4">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-9 w-full" />
        <div className="space-y-2 pt-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-full" />
          ))}
        </div>
      </div>

      {/* Main Content Skeleton */}
      <div className="flex-1">
        {/* Header Skeleton */}
        <div className="h-14 border-b flex items-center px-4 gap-4">
          <Skeleton className="h-6 w-32" />
          <div className="ml-auto flex items-center gap-2">
            <Skeleton className="h-9 w-9 rounded-full" />
            <Skeleton className="h-9 w-9 rounded-full" />
          </div>
        </div>

        {/* Page Content Skeleton */}
        <div className="p-8 space-y-8">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-96" />
          </div>

          {/* Stats Grid Skeleton */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-xl" />
            ))}
          </div>

          {/* Content Grid Skeleton */}
          <div className="grid gap-4 lg:grid-cols-4">
            <Skeleton className="h-[350px] rounded-xl lg:col-span-2" />
            <Skeleton className="h-[350px] rounded-xl lg:col-span-2" />
          </div>
        </div>
      </div>
    </div>
  );
}
