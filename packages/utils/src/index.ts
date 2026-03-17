/**
 * @my-blog/utils
 *
 * Shared Utilities
 *
 * Common utility functions used across the blog system.
 */

export const VERSION = "0.0.0";

/**
 * Format a date to ISO string
 * @param date - Date to format
 * @returns Formatted date string
 */
export function formatDate(date: Date): string {
  return date.toISOString();
}

/**
 * Generate a unique ID
 * @returns Unique ID string
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}
