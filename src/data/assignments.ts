import type { Assignment } from '../types';

export const assignments: Assignment[] = [
  // Mon 10 Aug
  { id: 'asg-01', clientId: 'cli-01', clId: 'cl-01', packageId: 'melur', date: '2026-08-10', startTime: '09:00', endTime: '13:00', location: 'Setia Alam', status: 'completed', paymentStatus: 'released' },
  { id: 'asg-02', clientId: 'cli-05', clId: 'cl-03', packageId: 'mawar', date: '2026-08-10', startTime: '08:30', endTime: '11:30', location: 'Shah Alam', status: 'completed', paymentStatus: 'released' },
  { id: 'asg-03', clientId: 'cli-06', clId: 'cl-02', packageId: 'mawar', date: '2026-08-10', startTime: '14:00', endTime: '17:30', location: 'Putrajaya', status: 'completed', paymentStatus: 'released' },
  // Tue 11 Aug
  { id: 'asg-04', clientId: 'cli-07', clId: 'cl-04', packageId: 'cempaka', date: '2026-08-11', startTime: '10:00', endTime: '17:30', location: 'Putrajaya', status: 'completed', paymentStatus: 'in-review' },
  { id: 'asg-05', clientId: 'cli-08', clId: 'cl-06', packageId: 'oversea', date: '2026-08-11', startTime: '08:00', endTime: '11:00', location: 'Kuala Lumpur', status: 'completed', paymentStatus: 'released' },
  { id: 'asg-06', clientId: 'cli-01', clId: 'cl-01', packageId: 'melur', date: '2026-08-11', startTime: '09:00', endTime: '13:00', location: 'Setia Alam', status: 'completed', paymentStatus: 'released' },
  // Wed 12 Aug
  { id: 'asg-07', clientId: 'cli-09', clId: 'cl-05', packageId: 'rafflesia', date: '2026-08-12', startTime: '07:30', endTime: '19:30', location: 'Kota Kemuning', status: 'completed', paymentStatus: 'released' },
  { id: 'asg-08', clientId: 'cli-10', clId: 'cl-12', packageId: 'dahlia', date: '2026-08-12', startTime: '09:00', endTime: '12:00', location: 'Ampang', status: 'completed', paymentStatus: 'pending' },
  { id: 'asg-09', clientId: 'cli-05', clId: 'cl-03', packageId: 'mawar', date: '2026-08-12', startTime: '08:30', endTime: '11:30', location: 'Shah Alam', status: 'completed', paymentStatus: 'released' },
  // Thu 13 Aug — today
  { id: 'asg-10', clientId: 'cli-01', clId: 'cl-01', packageId: 'melur', date: '2026-08-13', startTime: '09:00', endTime: '13:00', location: 'Setia Alam', status: 'confirmed' },
  { id: 'asg-11', clientId: 'cli-05', clId: 'cl-03', packageId: 'mawar', date: '2026-08-13', startTime: '08:30', endTime: '11:30', location: 'Shah Alam', status: 'confirmed' },
  { id: 'asg-12', clientId: 'cli-06', clId: 'cl-02', packageId: 'mawar', date: '2026-08-13', startTime: '14:00', endTime: '17:30', location: 'Putrajaya', status: 'pending' },
  { id: 'asg-13', clientId: 'cli-07', clId: 'cl-04', packageId: 'cempaka', date: '2026-08-13', startTime: '10:00', endTime: '17:30', location: 'Putrajaya', status: 'confirmed' },
  { id: 'asg-14', clientId: 'cli-09', clId: 'cl-05', packageId: 'rafflesia', date: '2026-08-13', startTime: '07:30', endTime: '19:30', location: 'Kota Kemuning', status: 'confirmed' },
  { id: 'asg-15', clientId: 'cli-08', clId: 'cl-06', packageId: 'oversea', date: '2026-08-13', startTime: '08:00', endTime: '11:00', location: 'Kuala Lumpur', status: 'confirmed' },
  // Fri 14 Aug — tomorrow (demo day)
  { id: 'asg-16', clientId: 'cli-01', clId: 'cl-01', packageId: 'melur', date: '2026-08-14', startTime: '09:00', endTime: '13:00', location: 'Setia Alam', status: 'confirmed' },
  { id: 'asg-17', clientId: 'cli-10', clId: 'cl-12', packageId: 'dahlia', date: '2026-08-14', startTime: '09:00', endTime: '12:00', location: 'Ampang', status: 'confirmed' },
  { id: 'asg-18', clientId: 'cli-07', clId: 'cl-04', packageId: 'cempaka', date: '2026-08-14', startTime: '10:00', endTime: '17:30', location: 'Putrajaya', status: 'confirmed' },
  { id: 'asg-19', clientId: 'cli-09', clId: 'cl-05', packageId: 'rafflesia', date: '2026-08-14', startTime: '07:30', endTime: '19:30', location: 'Kota Kemuning', status: 'pending' },
  { id: 'asg-20', clientId: 'cli-06', clId: 'cl-16', packageId: 'mawar', date: '2026-08-14', startTime: '14:00', endTime: '17:30', location: 'Sepang', status: 'cancelled', urgent: true },
];

export const unassignedClientIds = ['cli-02', 'cli-03', 'cli-04', 'cli-12', 'cli-14'];
