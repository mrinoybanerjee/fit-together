import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, parseISO } from 'date-fns';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/** Returns Tailwind color class based on recovery percentage */
export function getRecoveryColor(pct) {
  if (pct >= 67) return { text: 'text-recovery-green', stroke: '#10b981', bg: 'bg-recovery-green/10' };
  if (pct >= 34) return { text: 'text-recovery-yellow', stroke: '#f59e0b', bg: 'bg-recovery-yellow/10' };
  return { text: 'text-recovery-red', stroke: '#ef4444', bg: 'bg-recovery-red/10' };
}

/** Formats a date string like "2024-01-15" → "Jan 15" */
export function formatDate(dateStr) {
  try {
    return format(parseISO(dateStr), 'MMM d');
  } catch {
    return dateStr;
  }
}

/** Formats hours like 7.5 → "7h 30m" */
export function formatHours(hours) {
  if (!hours) return '—';
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

/** Formats large numbers like 9200 → "9,200" */
export function formatNumber(n) {
  return n?.toLocaleString() ?? '—';
}

/** Clamp a value to [min, max] */
export function clamp(val, min, max) {
  return Math.min(Math.max(val, min), max);
}

/** Compute SVG stroke-dashoffset for a circle of radius r, given pct 0-100 */
export function ringDashOffset(pct, radius = 45) {
  const safePct = isNaN(pct) || pct == null ? 0 : pct;
  const circumference = 2 * Math.PI * radius;
  return circumference * (1 - clamp(safePct, 0, 100) / 100);
}
