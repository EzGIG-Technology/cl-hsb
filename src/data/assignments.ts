import type { Assignment } from '../types';

// Seeded sessions for the demo week (TODAY = Thu 13 Aug 2026). All times sit inside opening hours
// (10.30am to 7.30pm) and each slot is as long as the booked treatment: 30 min for back, foot,
// mandi bunga and totok wajah, 90 min for Mix & Match, 60/90/120 min for traditional and prenatal.
// `location` is the area the session happens in: "Bandar Baru Bangi" means in-spa at Bangi Sentral,
// any other area is a home-service visit.
export const assignments: Assignment[] = [
  // Mon 10 Aug
  { id: 'asg-01', clientId: 'cli-11', clId: 'cl-01', packageId: 'traditional', date: '2026-08-10', startTime: '10:30', endTime: '11:30', location: 'Bandar Baru Bangi', status: 'completed', paymentStatus: 'released' },
  { id: 'asg-02', clientId: 'cli-15', clId: 'cl-03', packageId: 'back', date: '2026-08-10', startTime: '12:00', endTime: '12:30', location: 'Bandar Baru Bangi', status: 'completed', paymentStatus: 'released' },
  { id: 'asg-03', clientId: 'cli-05', clId: 'cl-02', packageId: 'back', date: '2026-08-10', startTime: '18:00', endTime: '18:30', location: 'Bandar Baru Bangi', status: 'completed', paymentStatus: 'released' },
  // Tue 11 Aug
  { id: 'asg-04', clientId: 'cli-07', clId: 'cl-04', packageId: 'totok-wajah', date: '2026-08-11', startTime: '14:00', endTime: '14:30', location: 'Putrajaya', status: 'completed', paymentStatus: 'in-review' },
  { id: 'asg-05', clientId: 'cli-08', clId: 'cl-06', packageId: 'mandi-bunga', date: '2026-08-11', startTime: '11:00', endTime: '11:30', location: 'Bandar Baru Bangi', status: 'completed', paymentStatus: 'released' },
  { id: 'asg-06', clientId: 'cli-01', clId: 'cl-01', packageId: 'traditional', date: '2026-08-11', startTime: '17:30', endTime: '19:00', location: 'Bandar Baru Bangi', status: 'completed', paymentStatus: 'released' },
  // Wed 12 Aug
  { id: 'asg-07', clientId: 'cli-13', clId: 'cl-05', packageId: 'mix-match', date: '2026-08-12', startTime: '11:00', endTime: '12:30', location: 'Bandar Baru Bangi', status: 'completed', paymentStatus: 'released' },
  { id: 'asg-08', clientId: 'cli-10', clId: 'cl-12', packageId: 'foot', date: '2026-08-12', startTime: '13:00', endTime: '13:30', location: 'Bandar Baru Bangi', status: 'completed', paymentStatus: 'pending' },
  { id: 'asg-09', clientId: 'cli-15', clId: 'cl-03', packageId: 'back', date: '2026-08-12', startTime: '16:00', endTime: '16:30', location: 'Bandar Baru Bangi', status: 'completed', paymentStatus: 'released' },
  // Thu 13 Aug (today)
  { id: 'asg-10', clientId: 'cli-06', clId: 'cl-01', packageId: 'traditional', date: '2026-08-13', startTime: '10:30', endTime: '11:30', location: 'Bandar Baru Bangi', status: 'confirmed' },
  { id: 'asg-11', clientId: 'cli-05', clId: 'cl-03', packageId: 'back', date: '2026-08-13', startTime: '18:00', endTime: '18:30', location: 'Bandar Baru Bangi', status: 'confirmed' },
  { id: 'asg-12', clientId: 'cli-10', clId: 'cl-02', packageId: 'back', date: '2026-08-13', startTime: '13:00', endTime: '13:30', location: 'Bandar Baru Bangi', status: 'pending' },
  { id: 'asg-13', clientId: 'cli-07', clId: 'cl-04', packageId: 'totok-wajah', date: '2026-08-13', startTime: '15:00', endTime: '15:30', location: 'Putrajaya', status: 'confirmed' },
  { id: 'asg-14', clientId: 'cli-09', clId: 'cl-05', packageId: 'mix-match', date: '2026-08-13', startTime: '11:00', endTime: '12:30', location: 'Kajang', status: 'confirmed' },
  { id: 'asg-15', clientId: 'cli-08', clId: 'cl-06', packageId: 'mandi-bunga', date: '2026-08-13', startTime: '16:30', endTime: '17:00', location: 'Bandar Baru Bangi', status: 'confirmed' },
  // Fri 14 Aug (tomorrow)
  { id: 'asg-16', clientId: 'cli-01', clId: 'cl-01', packageId: 'traditional', date: '2026-08-14', startTime: '17:30', endTime: '19:00', location: 'Bandar Baru Bangi', status: 'confirmed' },
  { id: 'asg-17', clientId: 'cli-10', clId: 'cl-12', packageId: 'foot', date: '2026-08-14', startTime: '13:00', endTime: '13:30', location: 'Bandar Baru Bangi', status: 'confirmed' },
  { id: 'asg-18', clientId: 'cli-08', clId: 'cl-04', packageId: 'totok-wajah', date: '2026-08-14', startTime: '14:30', endTime: '15:00', location: 'Bandar Baru Bangi', status: 'confirmed' },
  { id: 'asg-19', clientId: 'cli-06', clId: 'cl-05', packageId: 'mix-match', date: '2026-08-14', startTime: '14:00', endTime: '15:30', location: 'Bandar Baru Bangi', status: 'pending' },
  { id: 'asg-20', clientId: 'cli-05', clId: 'cl-16', packageId: 'back', date: '2026-08-14', startTime: '18:00', endTime: '18:30', location: 'Bandar Baru Bangi', status: 'cancelled', urgent: true },
];

/** Customers who have asked for a session but have no staff member booked yet (Bookings "needs a staff member"). */
export const unassignedClientIds = ['cli-02', 'cli-03', 'cli-04', 'cli-12', 'cli-14'];
