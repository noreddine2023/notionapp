"use client";

import * as React from "react";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

/**
 * Dashboard Layout Component
 * 
 * Architecture Decision: This component manages the overall app structure
 * including the responsive sidebar state. The layout is client-side because
 * it needs to manage interactive state (sidebar collapse, mobile menu).
 * 
 * The main content area automatically adjusts its margins based on sidebar
 * state, providing a seamless transition experience.
 */
export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  // Close mobile menu on route change (handled by parent if needed)
  const handleMobileMenuToggle = React.useCallback(() => {
    setMobileMenuOpen((prev) => !prev);
  }, []);

  const handleSidebarToggle = React.useCallback(() => {
    setSidebarCollapsed((prev) => !prev);
  }, []);

  return (
    <div className="relative flex min-h-screen bg-background">
      {/* Desktop Sidebar - Hidden on mobile */}
      <div className="hidden lg:flex lg:flex-col">
        <Sidebar
          isCollapsed={sidebarCollapsed}
          onToggle={handleSidebarToggle}
        />
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
            onClick={handleMobileMenuToggle}
          />
          <div className="fixed inset-y-0 left-0 z-50 lg:hidden">
            <Sidebar isCollapsed={false} onToggle={handleMobileMenuToggle} />
          </div>
        </>
      )}

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col">
        <Header onMobileMenuToggle={handleMobileMenuToggle} />
        <main
          className={cn(
            "flex-1 overflow-auto",
            "p-4 md:p-6 lg:p-8"
          )}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
