import type { LocationCapacity } from '../types';

// Monthly home-service slot caps by area around the Bangi Sentral outlet. In-spa sessions are capped
// by rooms, not area; these caps keep staff from being booked across too many far-flung visits.
export const locationCapacity: LocationCapacity[] = [
  { location: 'Bandar Baru Bangi', monthlySlots: 120 },
  { location: 'Kajang', monthlySlots: 60 },
  { location: 'Putrajaya', monthlySlots: 40 },
  { location: 'Cyberjaya', monthlySlots: 30 },
  { location: 'Semenyih', monthlySlots: 30 },
  { location: 'Seri Kembangan', monthlySlots: 24 },
  { location: 'Nilai', monthlySlots: 20 },
  { location: 'Dengkil', monthlySlots: 16 },
];
