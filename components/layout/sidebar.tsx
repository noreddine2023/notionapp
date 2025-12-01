"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  FileText,
  Search,
  Settings,
  ChevronLeft,
  ChevronRight,
  Beaker,
  FolderKanban,
  Users,
  HelpCircle,
} from "lucide-react";

import { cn } from "@/lib/utils";
import {
  Button,
  ScrollArea,
  Separator,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui";

/**
 * Navigation Item Type
 */
interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
}

/**
 * Navigation Configuration
 * 
 * Architecture Decision: Centralizing navigation items makes it easy to
 * add, remove, or reorder menu items without touching component code.
 */
const mainNavItems: NavItem[] = [
  { title: "Dashboard", href: "/", icon: Home },
  { title: "Notes", href: "/notes", icon: FileText },
  { title: "Research", href: "/research", icon: Beaker },
  { title: "Projects", href: "/projects", icon: FolderKanban },
];

const secondaryNavItems: NavItem[] = [
  { title: "Team", href: "/team", icon: Users },
  { title: "Settings", href: "/settings", icon: Settings },
  { title: "Help", href: "/help", icon: HelpCircle },
];

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

/**
 * Sidebar Component
 * 
 * Architecture Decision: The sidebar uses CSS transitions for smooth
 * collapse/expand animations. It's responsive and transforms into a
 * mobile-friendly drawer on smaller screens.
 */
export function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "relative flex h-full flex-col border-r bg-sidebar transition-all duration-300 ease-in-out",
          isCollapsed ? "w-[68px]" : "w-64"
        )}
      >
        {/* Logo Section */}
        <div className="flex h-14 items-center border-b px-4">
          <Link
            href="/"
            className={cn(
              "flex items-center gap-2 font-semibold",
              isCollapsed && "justify-center"
            )}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <FileText className="h-4 w-4" />
            </div>
            {!isCollapsed && (
              <span className="text-lg font-bold">NotionApp</span>
            )}
          </Link>
        </div>

        {/* Search */}
        {!isCollapsed && (
          <div className="p-4">
            <Button
              variant="outline"
              className="w-full justify-start text-muted-foreground"
            >
              <Search className="mr-2 h-4 w-4" />
              <span>Search...</span>
              <kbd className="pointer-events-none ml-auto inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                <span className="text-xs">⌘</span>K
              </kbd>
            </Button>
          </div>
        )}

        {/* Navigation */}
        <ScrollArea className="flex-1 px-3">
          <nav className="flex flex-col gap-1 py-2">
            {/* Main Navigation */}
            {mainNavItems.map((item) => (
              <NavLink
                key={item.href}
                item={item}
                isActive={pathname === item.href}
                isCollapsed={isCollapsed}
              />
            ))}

            <Separator className="my-2" />

            {/* Secondary Navigation */}
            {secondaryNavItems.map((item) => (
              <NavLink
                key={item.href}
                item={item}
                isActive={pathname === item.href}
                isCollapsed={isCollapsed}
              />
            ))}
          </nav>
        </ScrollArea>

        {/* Collapse Toggle */}
        <div className="border-t p-3">
          <Button
            variant="ghost"
            size={isCollapsed ? "icon" : "sm"}
            className={cn("w-full", !isCollapsed && "justify-start")}
            onClick={onToggle}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <>
                <ChevronLeft className="mr-2 h-4 w-4" />
                <span>Collapse</span>
              </>
            )}
          </Button>
        </div>
      </aside>
    </TooltipProvider>
  );
}

/**
 * Nav Link Component
 * 
 * Renders navigation items with tooltip support when sidebar is collapsed.
 */
interface NavLinkProps {
  item: NavItem;
  isActive: boolean;
  isCollapsed: boolean;
}

function NavLink({ item, isActive, isCollapsed }: NavLinkProps) {
  const Icon = item.icon;

  if (isCollapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            href={item.href}
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-lg transition-colors",
              isActive
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            )}
          >
            <Icon className="h-4 w-4" />
            <span className="sr-only">{item.title}</span>
          </Link>
        </TooltipTrigger>
        <TooltipContent side="right">
          {item.title}
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <Link
      href={item.href}
      className={cn(
        "flex h-9 items-center gap-3 rounded-lg px-3 text-sm transition-colors",
        isActive
          ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
          : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span className="truncate">{item.title}</span>
      {item.badge && (
        <span className="ml-auto rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
          {item.badge}
        </span>
      )}
    </Link>
  );
}
