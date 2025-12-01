"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui";
import { AlertCircle, RefreshCw } from "lucide-react";

/**
 * Error Boundary Component
 * 
 * Architecture Decision: Using Next.js 15's error boundary provides
 * a graceful fallback for runtime errors. The component attempts to
 * recover by allowing users to retry the operation.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service in production
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="mx-auto max-w-md text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
          <AlertCircle className="h-8 w-8 text-destructive" />
        </div>
        <h2 className="mb-2 text-2xl font-bold tracking-tight">
          Something went wrong
        </h2>
        <p className="mb-6 text-muted-foreground">
          An unexpected error occurred. Please try again or contact support if
          the problem persists.
        </p>
        {error.digest && (
          <p className="mb-4 text-xs text-muted-foreground font-mono">
            Error ID: {error.digest}
          </p>
        )}
        <div className="flex items-center justify-center gap-4">
          <Button onClick={() => reset()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Try again
          </Button>
          <Button variant="outline" onClick={() => (window.location.href = "/")}>
            Go to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
