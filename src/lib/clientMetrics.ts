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

function slotMinutes(a: Pick<Assignment, 'startTime' | 'endTime'>) {
  const [sh, sm] = a.startTime.split(':').map(Number);
  const [eh, em] = a.endTime.split(':').map(Number);
  return eh * 60 + em - (sh * 60 + sm);
}

/**
 * Price of one session: the price of the tier the client booked. The tier is matched on the
 * session's own length first (a 90-min slot = the 90-min price), then on the length saved on the
 * client (`packageMinutes`), and falls back to the treatment's first tier.
 */
export function sessionPrice(a: Assignment, client: Client, pkg: Package | undefined) {
  if (!pkg || pkg.tiers.length === 0) return 0;
  const byLength = pkg.tiers.find((t) => t.minutes === slotMinutes(a));
  if (byLength) return byLength.price;
  const saved = client.packageMinutes?.[pkg.id];
  const bySaved = saved ? pkg.tiers.find((t) => t.minutes === saved) : undefined;
  return (bySaved ?? pkg.tiers[0]).price;
}

/**
 * Monthly spend and session-count breakdown for a client. Aug 2026 uses the real seeded sessions,
 * each priced at its booked tier. Earlier months are deterministic mock history (the dataset only
 * spans a few real days), seeded by client id so the numbers stay stable across renders: a regular
 * comes in one to four times a month and spends RM 50 to RM 160 a visit.
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
        .reduce((sum, a) => sum + sessionPrice(a, client, packageById(a.packageId)), 0);
      return { month: `${label} 2026`, sessionsPlanned: planned, sessionsCompleted: completed, sessionsCancelled: cancelled, spent, isCurrent };
    }
    const sessionsCompleted = 1 + Math.floor(rand() * 4);
    const sessionsCancelled = rand() > 0.7 ? 1 : 0;
    const spent = sessionsCompleted * (50 + Math.floor(rand() * 11) * 10);
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
