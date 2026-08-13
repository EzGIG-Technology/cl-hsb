import type { ConfinementLady, Assignment } from '../types';

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
