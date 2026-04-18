// ─────────────────────────────────────────────────────────────
// utils/formatDate.ts
// ─────────────────────────────────────────────────────────────

/**
 * "Jan 12, 2025"
 */
export function formatDate(iso: string): string {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(iso));
  }
  
  /**
   * "Jan 12, 2025 at 3:45 PM"
   */
  export function formatDateTime(iso: string): string {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(new Date(iso));
  }
  
  /**
   * Relative time: "2 hours ago", "in 3 days", etc.
   * Uses Intl.RelativeTimeFormat for locale-aware output.
   */
  export function formatRelativeTime(iso: string): string {
    const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
    const diffMs = new Date(iso).getTime() - Date.now();
    const diffSec = Math.round(diffMs / 1000);
    const diffMin = Math.round(diffSec / 60);
    const diffHrs = Math.round(diffMin / 60);
    const diffDays = Math.round(diffHrs / 24);
  
    if (Math.abs(diffSec) < 60) return rtf.format(diffSec, 'second');
    if (Math.abs(diffMin) < 60) return rtf.format(diffMin, 'minute');
    if (Math.abs(diffHrs) < 24) return rtf.format(diffHrs, 'hour');
    if (Math.abs(diffDays) < 30) return rtf.format(diffDays, 'day');
  
    // Fall back to absolute date for older items
    return formatDate(iso);
  }