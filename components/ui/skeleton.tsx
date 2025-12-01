import { cn } from "@/lib/utils";

/**
 * Skeleton Component
 * 
 * Architecture Decision: Skeleton loaders provide better perceived performance
 * than spinners. They hint at the shape of content that's loading, reducing
 * layout shift and improving user experience.
 */
function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-primary/10", className)}
      {...props}
    />
  );
}

export { Skeleton };
