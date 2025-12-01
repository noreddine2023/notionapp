"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Skeleton,
} from "@/components/ui";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

/**
 * Chart Data Type
 */
interface ChartDataPoint {
  name: string;
  notes: number;
  papers: number;
}

/**
 * Mock Data - In production, this would come from server actions
 */
const mockChartData: ChartDataPoint[] = [
  { name: "Mon", notes: 4, papers: 2 },
  { name: "Tue", notes: 6, papers: 3 },
  { name: "Wed", notes: 8, papers: 5 },
  { name: "Thu", notes: 5, papers: 4 },
  { name: "Fri", notes: 10, papers: 6 },
  { name: "Sat", notes: 7, papers: 3 },
  { name: "Sun", notes: 9, papers: 4 },
];

interface ActivityChartProps {
  isLoading?: boolean;
}

/**
 * Activity Chart Component
 * 
 * Architecture Decision: Using Recharts for data visualization provides
 * a good balance of features and bundle size. The chart is fully responsive
 * and supports both light and dark modes via CSS variables.
 */
export function ActivityChart({ isLoading = false }: ActivityChartProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-full lg:col-span-2">
      <CardHeader>
        <CardTitle>Weekly Activity</CardTitle>
        <CardDescription>
          Notes created and papers saved this week
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={mockChartData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorNotes" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="hsl(var(--chart-1))"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="hsl(var(--chart-1))"
                    stopOpacity={0}
                  />
                </linearGradient>
                <linearGradient id="colorPapers" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="hsl(var(--chart-2))"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="hsl(var(--chart-2))"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                className="stroke-muted"
                vertical={false}
              />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                className="text-xs fill-muted-foreground"
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                className="text-xs fill-muted-foreground"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--popover))",
                  borderColor: "hsl(var(--border))",
                  borderRadius: "var(--radius)",
                }}
                labelStyle={{
                  color: "hsl(var(--popover-foreground))",
                }}
              />
              <Area
                type="monotone"
                dataKey="notes"
                stroke="hsl(var(--chart-1))"
                fillOpacity={1}
                fill="url(#colorNotes)"
                strokeWidth={2}
                name="Notes"
              />
              <Area
                type="monotone"
                dataKey="papers"
                stroke="hsl(var(--chart-2))"
                fillOpacity={1}
                fill="url(#colorPapers)"
                strokeWidth={2}
                name="Papers"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
