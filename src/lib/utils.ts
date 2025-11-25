import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Utility function to construct className strings conditionally.
 * Combines `clsx` for conditional classes and `tailwind-merge` to resolve conflicting Tailwind CSS classes.
 *
 * @param inputs - A list of class names, objects, or arrays to process.
 * @returns A merged string of class names.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
