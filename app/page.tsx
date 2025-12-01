import { Suspense } from "react";
import { DashboardLayout } from "@/components/layout";
import {
  StatsOverview,
  RecentActivity,
  ActivityChart,
} from "@/components/dashboard";

/**
 * Dashboard Page (Server Component)
 * 
 * Architecture Decision: This page is a React Server Component by default.
 * Heavy data fetching happens here at the server level, reducing client
 * bundle size. Client components like charts are wrapped in Suspense
 * boundaries for progressive loading.
 */
export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here&apos;s an overview of your workspace.
          </p>
        </div>

        {/* Stats Overview - Bento Box Grid */}
        <Suspense fallback={<StatsOverview isLoading />}>
          <StatsOverview />
        </Suspense>

        {/* Main Content Grid - Bento Box Layout */}
        <div className="grid gap-4 lg:grid-cols-4">
          {/* Activity Chart */}
          <Suspense fallback={<ActivityChart isLoading />}>
            <ActivityChart />
          </Suspense>

          {/* Recent Activity */}
          <Suspense fallback={<RecentActivity isLoading />}>
            <RecentActivity />
          </Suspense>
        </div>
      </div>
    </DashboardLayout>
  );
}
