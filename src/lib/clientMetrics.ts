import type { Client, Assignment, Package } from '../types';

const MONTH_LABELS = ['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'] as const;

function seededRandom(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return () => {
    h = (h * 1664525 + 1013904223) >>> 0;
    return h / 4294967296;
  };
}

export interface ClientMonthSummary {
  month: string;
  sessionsPlanned: number;
  sessionsCompleted: number;
  sessionsCancelled: number;
  spent: number;
  isCurrent: boolean;
}

function priceOf(pkg: Package | undefined) {
  if (!pkg) return 0;
  return pkg.tiers[0]?.price ?? pkg.sessionPrice?.perSession ?? 0;
}

/**
 * Monthly spend + session-count breakdown for a customer. Aug 2026 uses real seeded booking data;
 * earlier months are deterministic mock history (dataset only spans a few real days), seeded by
 * client id so the numbers stay stable across renders.
 */
export function monthlySpendForClient(
  client: Client,
  bookingsForClient: Assignment[],
  packageById: (id: string) => Package | undefined,
): ClientMonthSummary[] {
  const rand = seededRandom(client.id);
  return MONTH_LABELS.map((label) => {
    const isCurrent = label === 'Aug';
    if (isCurrent) {
      const planned = bookingsForClient.filter((a) => a.status !== 'cancelled').length;
      const completed = bookingsForClient.filter((a) => a.status === 'completed').length;
      const cancelled = bookingsForClient.filter((a) => a.status === 'cancelled').length;
      const spent = bookingsForClient
        .filter((a) => a.status === 'completed' || a.status === 'confirmed')
        .reduce((sum, a) => sum + priceOf(packageById(a.packageId)), 0);
      return { month: `${label} 2026`, sessionsPlanned: planned, sessionsCompleted: completed, sessionsCancelled: cancelled, spent, isCurrent };
    }
    const sessionsCompleted = 1 + Math.floor(rand() * 4);
    const sessionsCancelled = rand() > 0.7 ? 1 : 0;
    const spent = sessionsCompleted * (800 + Math.floor(rand() * 700));
    return {
      month: `${label} 2026`,
      sessionsPlanned: sessionsCompleted + sessionsCancelled,
      sessionsCompleted,
      sessionsCancelled,
      spent,
      isCurrent,
    };
  });
}
