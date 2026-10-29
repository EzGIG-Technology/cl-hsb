export const TODAY = new Date(2026, 7, 13); // 13 Aug 2026
export const TODAY_STR = '2026-08-13';

export function toDateStr(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function formatTime12(time: string) {
  const [h, m] = time.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, '0')} ${period}`;
}

export function formatDateLabel(dateStr: string) {
  const d = new Date(`${dateStr}T00:00:00`);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

export function formatWeekdayDate(d: Date) {
  return d.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' });
}

export type ExpiryUrgency = 'expired' | 'critical' | 'warning' | 'ok';

/** Days-to-expiry bucket used for certification / work-permit / passport expiry badges. */
export function expiryUrgency(dateStr: string, todayStr: string = TODAY_STR): ExpiryUrgency {
  const daysLeft = Math.floor((new Date(`${dateStr}T00:00:00`).getTime() - new Date(`${todayStr}T00:00:00`).getTime()) / 86400000);
  if (daysLeft < 0) return 'expired';
  if (daysLeft < 30) return 'critical';
  if (daysLeft < 90) return 'warning';
  return 'ok';
}

export const expiryUrgencyStyles: Record<ExpiryUrgency, string> = {
  expired: 'bg-red-100 text-red-700',
  critical: 'bg-red-100 text-red-700',
  warning: 'bg-brand-amber-light text-brand-amber',
  ok: 'bg-brand-lavender-light text-brand-lavender',
};

export const expiryUrgencyLabels: Record<ExpiryUrgency, string> = {
  expired: 'Expired',
  critical: 'Expiring soon',
  warning: 'Renew soon',
  ok: 'Valid',
};
