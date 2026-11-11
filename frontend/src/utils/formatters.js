/**
 * Format ISO date string to readable format e.g. "Mon, Nov 16, 2026"
 */
export function formatDate(dateString, options = {}) {
  if (!dateString) return 'N/A';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return 'Invalid date';

    const defaultOptions = {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    };

    return new Intl.DateTimeFormat('en-US', { ...defaultOptions, ...options }).format(d);
  } catch {
    return dateString;
  }
}

/**
 * Format 24h time "14:30" to 12h "2:30 PM"
 */
export function formatTime(timeStr) {
  if (!timeStr) return '';
  try {
    const [h, m] = timeStr.split(':').map(Number);
    const period = h >= 12 ? 'PM' : 'AM';
    const displayH = h % 12 === 0 ? 12 : h % 12;
    return `${displayH}:${String(m).padStart(2, '0')} ${period}`;
  } catch {
    return timeStr;
  }
}

/**
 * Format currency amount e.g. "$120.00"
 */
export function formatCurrency(amount, currency = 'USD') {
  if (amount === null || amount === undefined) return '$0.00';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(Number(amount));
}

/**
 * Day of week integer to readable name
 */
export const DAYS_OF_WEEK = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

export function getDayName(dayIndex) {
  return DAYS_OF_WEEK[dayIndex] || `Day ${dayIndex}`;
}

/**
 * Get status color classes for appointment status
 */
export function getStatusBadgeConfig(status) {
  switch (status?.toUpperCase()) {
    case 'CONFIRMED':
      return {
        label: 'Confirmed',
        bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        dot: 'bg-emerald-500',
      };
    case 'PENDING':
      return {
        label: 'Pending Approval',
        bg: 'bg-amber-50 text-amber-700 border-amber-200',
        dot: 'bg-amber-500',
      };
    case 'COMPLETED':
      return {
        label: 'Completed',
        bg: 'bg-blue-50 text-blue-700 border-blue-200',
        dot: 'bg-blue-500',
      };
    case 'CANCELLED':
      return {
        label: 'Cancelled',
        bg: 'bg-rose-50 text-rose-700 border-rose-200',
        dot: 'bg-rose-500',
      };
    case 'REJECTED':
      return {
        label: 'Declined',
        bg: 'bg-slate-100 text-slate-700 border-slate-300',
        dot: 'bg-slate-400',
      };
    default:
      return {
        label: status || 'Unknown',
        bg: 'bg-slate-100 text-slate-700 border-slate-200',
        dot: 'bg-slate-400',
      };
  }
}
