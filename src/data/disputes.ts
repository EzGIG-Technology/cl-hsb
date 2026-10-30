import type { Dispute } from '../types';

// Seed complaints raised against a session, each tied to a staff member and a customer from the demo week.
export const disputes: Dispute[] = [
  {
    id: 'DSP-1042',
    date: '2026-08-12',
    clId: 'cl-12',
    clientId: 'cli-10',
    issue: 'Missing check-out selfie',
    detail: 'Foot reflexology marked complete but no check-out selfie was captured before the app closed. Payment held until the front desk confirms the session.',
    severity: 'High',
    status: 'Open',
  },
  {
    id: 'DSP-1041',
    date: '2026-08-11',
    clId: 'cl-04',
    clientId: 'cli-07',
    issue: 'Home-service address mix-up',
    detail: 'The CL went to the customer’s old address in Presint 9 and arrived at Presint 16 25 minutes late. Session was shortened to fit the customer’s next appointment.',
    severity: 'Medium',
    status: 'Open',
  },
  {
    id: 'DSP-1039',
    date: '2026-08-12',
    clId: 'cl-03',
    clientId: 'cli-15',
    issue: 'Pressure too hard',
    detail: 'Customer said the back massage was much firmer than usual and she was sore the next day. Her pressure preference was not checked at the start of the session.',
    severity: 'High',
    status: 'Open',
  },
  {
    id: 'DSP-1035',
    date: '2026-08-08',
    clId: 'cl-14',
    clientId: 'cli-13',
    issue: 'Room not ready',
    detail: 'Customer waited 20 minutes at reception because the room had not been cleaned after the previous session. Apologised and gave a free 15-minute foot add-on.',
    severity: 'Medium',
    status: 'Resolved',
  },
];
