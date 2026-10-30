import type { Dispute } from '../types';

export const disputes: Dispute[] = [
  {
    id: 'DSP-1042',
    date: '2026-08-12',
    clId: 'cl-10',
    clientId: 'cli-15',
    issue: 'Missing Clock-Out Selfie',
    detail: 'Session marked complete but no check-out selfie was captured before the app closed.',
    severity: 'High',
    status: 'Open',
  },
  {
    id: 'DSP-1041',
    date: '2026-08-12',
    clId: 'cl-04',
    clientId: 'cli-07',
    issue: 'GPS Mismatch',
    detail: 'Check-in location was 4.2km from the registered customer address.',
    severity: 'Medium',
    status: 'Open',
  },
  {
    id: 'DSP-1039',
    date: '2026-08-11',
    clId: 'cl-10',
    clientId: 'cli-11',
    issue: 'Incomplete Checklist',
    detail: 'Only 6 of 9 daily care tasks were marked done before check-out.',
    severity: 'High',
    status: 'Open',
  },
  {
    id: 'DSP-1035',
    date: '2026-08-08',
    clId: 'cl-14',
    clientId: 'cli-15',
    issue: 'Late Check-In',
    detail: 'Checked in 55 minutes after the scheduled start time, no prior notice given.',
    severity: 'Medium',
    status: 'Resolved',
  },
];
