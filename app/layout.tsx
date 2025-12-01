import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";

/**
 * Font Configuration
 * 
 * Architecture Decision: Using system fonts with Inter/Geist-like fallbacks.
 * This approach ensures optimal performance and avoids external font fetching.
 * CSS variables are used for consistent font application throughout the app.
 */

export const metadata: Metadata = {
  title: "NotionApp - Modern Note Taking",
  description:
    "A Series A ready note-taking application with research capabilities",
  keywords: ["notes", "research", "productivity", "notion", "workspace"],
};

/**
 * Root Layout Component
 * 
 * Architecture Decision: Using Server Components for the layout reduces
 * client-side JavaScript bundle size. The ThemeProvider is the only client
 * component required at this level for theme switching functionality.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
