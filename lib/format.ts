/**
 * Financial Number Formatting Utilities
 * Following Nepali/Indian comma format: 1,23,45,678.00
 */

/**
 * Format currency with Indian/Nepali grouping and 2 decimal places.
 * Negatives are wrapped in parentheses.
 */
export function formatCurrency(n: number): string {
  if (n === 0 || n === null || n === undefined) return '—';
  
  const abs = Math.abs(n);
  const formatted = abs.toLocaleString('en-IN', { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  });
  
  return n < 0 ? `(${formatted})` : formatted;
}

/**
 * Format quantity with up to 3 decimal places.
 */
export function formatQty(n: number): string {
  if (n === 0 || n === null || n === undefined) return '—';
  return n.toLocaleString('en-IN', { 
    maximumFractionDigits: 3 
  });
}

/**
 * Format rates with 2-4 decimal places.
 */
export function formatRate(n: number): string {
  if (n === 0 || n === null || n === undefined) return '—';
  return n.toLocaleString('en-IN', { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 4 
  });
}

/**
 * Format percentage with 1 decimal place.
 */
export function formatPercent(n: number): string {
  if (n === 0 || n === null || n === undefined) return '—';
  return `${n.toFixed(1)}%`;
}

/**
 * Format date to a cleaner display string.
 * Example: 2024-04-30 -> 30 Apr 2024
 */
export function formatDateDisplay(dateStr: string): string {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

/**
 * Helper for Nepali Month names from lib/constants.ts if needed,
 * but these utilities focus on formatting.
 */
