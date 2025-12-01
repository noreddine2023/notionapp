import { Suspense } from "react";
import { DashboardLayout } from "@/components/layout";
import { NotesTable } from "./notes-table";
import { Skeleton } from "@/components/ui";

/**
 * Notes Page (Server Component)
 * 
 * Architecture Decision: This page lists all notes with server-side
 * filtering, sorting, and pagination using TanStack Table.
 */
export default function NotesPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notes</h1>
          <p className="text-muted-foreground">
            Manage and organize all your notes in one place.
          </p>
        </div>

        {/* Notes Table */}
        <Suspense
          fallback={
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <Skeleton className="h-9 w-64" />
                <div className="flex items-center gap-2">
                  <Skeleton className="h-9 w-24" />
                  <Skeleton className="h-9 w-28" />
                </div>
              </div>
              <Skeleton className="h-[400px] w-full rounded-md" />
            </div>
          }
        >
          <NotesTable />
        </Suspense>
      </div>
    </DashboardLayout>
  );
}
