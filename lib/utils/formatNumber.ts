// lib/utils/formatNumber.ts

/**
 * Format number with k/M suffix for display
 * Examples:
 * - 640 -> "640"
 * - 1200 -> "1.2k"
 * - 38000 -> "38k"
 * - 1500000 -> "1.5M"
 */
export function formatNumberWithSuffix(num: number): string {
  if (num < 1000) {
    return num.toString();
  }
  
  if (num < 1000000) {
    const k = num / 1000;
    // Remove unnecessary decimals (e.g. 1.0k -> 1k)
    return k % 1 === 0 ? `${k}k` : `${k.toFixed(1)}k`;
  }
  
  const m = num / 1000000;
  return m % 1 === 0 ? `${m}M` : `${m.toFixed(1)}M`;
}

