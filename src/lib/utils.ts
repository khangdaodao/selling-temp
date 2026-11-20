/**
 * Shared className merging helper used by shadcn/ui primitives and feature components.
 *
 * Related: src/components/ui/*
 */

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combines conditional class names with `clsx` and resolves Tailwind CSS utility conflicts via `tailwind-merge`.
 *
 * @param inputs - Variable list of class values, arrays, or conditional objects.
 * @returns Normalized Tailwind CSS class string.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
