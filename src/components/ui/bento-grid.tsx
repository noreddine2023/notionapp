import * as React from "react";
import { cn } from "../../lib/utils";

export interface BentoGridProps extends React.HTMLAttributes<HTMLDivElement> {
  columns?: 1 | 2 | 3 | 4;
}

const BentoGrid = React.forwardRef<HTMLDivElement, BentoGridProps>(
  ({ className, columns = 3, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "grid gap-4 auto-rows-[minmax(200px,auto)]",
          columns === 1 && "grid-cols-1",
          columns === 2 && "grid-cols-1 md:grid-cols-2",
          columns === 3 && "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
          columns === 4 && "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
BentoGrid.displayName = "BentoGrid";

export interface BentoItemProps extends React.HTMLAttributes<HTMLDivElement> {
  span?: "default" | "wide" | "tall" | "large";
}

const BentoItem = React.forwardRef<HTMLDivElement, BentoItemProps>(
  ({ className, span = "default", children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-2xl border border-white/20 dark:border-white/10",
          "bg-white/70 dark:bg-slate-900/80",
          "backdrop-blur-xl shadow-lg p-6",
          "transition-all duration-200",
          "hover:shadow-xl hover:scale-[1.02] hover:-translate-y-0.5",
          span === "wide" && "md:col-span-2",
          span === "tall" && "md:row-span-2",
          span === "large" && "md:col-span-2 md:row-span-2",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
BentoItem.displayName = "BentoItem";

export { BentoGrid, BentoItem };
