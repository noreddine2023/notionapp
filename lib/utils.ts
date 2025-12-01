import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility function for merging Tailwind CSS classes
 * 
 * Architecture Decision: Using clsx + tailwind-merge provides the best
 * developer experience for conditionally applying classes while avoiding
 * Tailwind class conflicts (e.g., 'p-2 p-4' resolves to 'p-4').
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
