import type { ConfinementLady, Assignment } from '../types';

const HOURLY_RATE = 22;
const HOURS_PER_SESSION = 4;
/** Last 6 months ending at the demo's "today" (Aug 2026) — Aug uses real seeded assignment data, earlier months are deterministic mock history. */
const MONTH_LABELS = ['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'] as const;

/** Small deterministic PRNG keyed by a string id, so mock monthly history stays stable across renders/reloads instead of re-randomizing. */
function seededRandom(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return () => {
    h = (h * 1664525 + 1013904223) >>> 0;
    return h / 4294967296;
  };
}

export interface CLMonthSummary {
  month: string;
  approvedSessions: number;
  disapprovedSessions: number;
  earned: number;
  lost: number;
  isCurrent: boolean;
}

/**
 * Monthly approved-vs-disapproved session breakdown and pay for a CL. Aug 2026 (the demo's "now")
 * is computed from real seeded/store assignment + approval data; earlier months are seeded mock
 * history since the dataset only spans a few days — deterministic per CL id so numbers don't jitter.
 */
export function monthlyFinancialsForCL(cl: ConfinementLady, assignmentsForCL: Assignment[]): CLMonthSummary[] {
  const rand = seededRandom(cl.id);
  return MONTH_LABELS.map((label) => {
    const isCurrent = label === 'Aug';
    if (isCurrent) {
      const completed = assignmentsForCL.filter((a) => a.status === 'completed');
      const approved = completed.filter((a) => a.approvalStatus === 'approved' || (!a.approvalStatus && a.paymentStatus === 'released')).length;
      const disapproved = completed.length - approved;
      return {
        month: `${label} 2026`,
        approvedSessions: approved,
        disapprovedSessions: disapproved,
        earned: approved * HOURS_PER_SESSION * HOURLY_RATE,
        lost: disapproved * HOURS_PER_SESSION * HOURLY_RATE,
        isCurrent,
      };
    }
    const approvedSessions = 6 + Math.floor(rand() * 10);
    const disapprovedSessions = Math.floor(rand() * 3);
    return {
      month: `${label} 2026`,
      approvedSessions,
      disapprovedSessions,
      earned: approvedSessions * HOURS_PER_SESSION * HOURLY_RATE,
      lost: disapprovedSessions * HOURS_PER_SESSION * HOURLY_RATE,
      isCurrent,
    };
  });
}

export function computeCLMetrics(cl: ConfinementLady, assignmentsForCL: Assignment[]) {
  const leaderboardPoints = cl.completedAssignments * 12 + Math.round(cl.rating * 40);
  const verifiedHours = cl.completedAssignments * 4;
  const lifetimeEarnings = verifiedHours * 22;
  const goodReviews = Math.round(cl.reviewCount * 0.91);
  const poorReviews = cl.reviewCount - goodReviews;
  const currentJob = assignmentsForCL.find((a) => a.status === 'confirmed' || a.status === 'pending');
  return {
    leaderboardPoints,
    verifiedHours,
    lifetimeEarnings,
    goodReviews,
    poorReviews,
    currentJobId: currentJob ? currentJob.id.toUpperCase().replace('ASG-', 'JOB-') : '—',
  };
}

export function leaderboardRank(cls: ConfinementLady[]) {
  return [...cls].sort((a, b) => b.completedAssignments * 12 + b.rating * 40 - (a.completedAssignments * 12 + a.rating * 40));
}
