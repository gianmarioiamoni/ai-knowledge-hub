/**
 * Standard layout classes for consistent page margins aligned with header
 * Used across all main page layouts to ensure uniform spacing
 * 
 * Breakpoints:
 * - Mobile: px-6 (24px horizontal padding)
 * - sm (≥640px): px-6 (24px horizontal padding)
 * - lg (≥1024px): px-6 (24px horizontal padding)
 * - xl (≥1280px): px-0 (no padding, content edge-to-edge within max-w-6xl)
 */

export const LAYOUT_CLASSES = {
  /** Standard horizontal padding matching header */
  horizontalPadding: "px-6 sm:px-6 lg:px-6 xl:px-0",
  
  /** Full page container with standard padding */
  pageContainer: "mx-auto flex min-h-screen max-w-6xl flex-col gap-8 px-6 py-10 sm:px-6 lg:px-6 xl:px-0",
  
  /** Wider gap variant (12 instead of 8) */
  pageContainerWide: "mx-auto flex min-h-screen max-w-6xl flex-col gap-12 px-6 py-12 sm:px-6 lg:px-6 xl:px-0",
} as const;

