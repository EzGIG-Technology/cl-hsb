import type { Therapist, Assignment } from '../types';

/**
 * Therapist pay is a commission on treatment time: RM 40 for every hour on the bed. That is half of a
 * 60-minute traditional massage (RM 80) and 40% of a 30-minute back or foot session (RM 50 for half an
 * hour), which lands monthly payroll at roughly 45% of revenue.
 */
export const HOURLY_RATE = 40;
/** Average treatment time per session, used where only a session count is known (lifetime totals, mock history). */
export const HOURS_PER_SESSION = 1;
/** Last 6 months ending at the demo's "today" (Aug 2026). Aug uses real seeded session data, earlier months are deterministic mock history. */
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

/** Treatment time of one session in hours, from its start and end time (30 min = 0.5). */
export function sessionHours(a: Pick<Assignment, 'startTime' | 'endTime'>) {
  const [sh, sm] = a.startTime.split(':').map(Number);
  const [eh, em] = a.endTime.split(':').map(Number);
  const minutes = eh * 60 + em - (sh * 60 + sm);
  return minutes > 0 ? minutes / 60 : HOURS_PER_SESSION;
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
 * Monthly approved-vs-disapproved session breakdown and pay for a therapist. Aug 2026 (the demo's
 * "now") is computed from the real seeded/store sessions and their approval status, paid on actual
 * treatment time. Earlier months are seeded mock history (the dataset only spans a few days),
 * deterministic per therapist id so the numbers don't jitter. A full-time therapist does roughly
 * 20 to 35 sessions a month.
 */
export function monthlyFinancialsForCL(cl: Therapist, assignmentsForCL: Assignment[]): CLMonthSummary[] {
  const rand = seededRandom(cl.id);
  return MONTH_LABELS.map((label) => {
    const isCurrent = label === 'Aug';
    if (isCurrent) {
      const completed = assignmentsForCL.filter((a) => a.status === 'completed');
      const isApproved = (a: Assignment) => a.approvalStatus === 'approved' || (!a.approvalStatus && a.paymentStatus === 'released');
      const approved = completed.filter(isApproved);
      const disapproved = completed.filter((a) => !isApproved(a));
      const pay = (list: Assignment[]) => Math.round(list.reduce((sum, a) => sum + sessionHours(a), 0) * HOURLY_RATE);
      return {
        month: `${label} 2026`,
        approvedSessions: approved.length,
        disapprovedSessions: disapproved.length,
        earned: pay(approved),
        lost: pay(disapproved),
        isCurrent,
      };
    }
    const approvedSessions = 18 + Math.floor(rand() * 16);
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

/**
 * Good/poor review split blended from real per-review data plus legacy aggregate history.
 * `reviewCount` predates the `reviews[]` array, so any count beyond what's in `reviews[]` is
 * assumed to follow the original 91% positive baseline; real reviews always count exactly.
 */
function reviewSplit(cl: Therapist) {
  const detailedGood = cl.reviews.filter((r) => r.rating >= 4).length;
  const detailedPoor = cl.reviews.length - detailedGood;
  const legacyCount = Math.max(0, cl.reviewCount - cl.reviews.length);
  const legacyGood = Math.round(legacyCount * 0.91);
  return { goodReviews: detailedGood + legacyGood, poorReviews: detailedPoor + (legacyCount - legacyGood) };
}

export function computeCLMetrics(cl: Therapist, assignmentsForCL: Assignment[]) {
  const leaderboardPoints = cl.completedAssignments * 12 + Math.round(cl.rating * 40);
  const verifiedHours = cl.completedAssignments * HOURS_PER_SESSION;
  const lifetimeEarnings = verifiedHours * HOURLY_RATE;
  const { goodReviews, poorReviews } = reviewSplit(cl);
  const currentJob = assignmentsForCL.find((a) => a.status === 'confirmed' || a.status === 'pending');
  return {
    leaderboardPoints,
    verifiedHours,
    lifetimeEarnings,
    goodReviews,
    poorReviews,
    currentJobId: currentJob ? currentJob.id.toUpperCase().replace('ASG-', 'SES-') : '',
  };
}

export function leaderboardRank(cls: Therapist[]) {
  return [...cls].sort((a, b) => b.completedAssignments * 12 + b.rating * 40 - (a.completedAssignments * 12 + a.rating * 40));
}
