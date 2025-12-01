"use client";

/**
 * Theme Provider Component
 * 
 * Architecture Decision: This is a client component that wraps next-themes
 * for dark/light mode support. It's kept minimal and only handles theme
 * switching functionality, allowing the rest of the app to use Server Components.
 */

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
