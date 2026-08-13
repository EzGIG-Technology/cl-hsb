import type { LocationCapacity } from '../types';

// Monthly slot caps by area — mirrors the manual colour-coded sheet NR Mothercare
// currently keeps, so admins can see at a glance which limited-slot kampung areas
// are close to full before accepting a new booking.
export const locationCapacity: LocationCapacity[] = [
  { location: 'Kuala Lumpur', monthlySlots: 60 },
  { location: 'Petaling', monthlySlots: 45 },
  { location: 'Gombak', monthlySlots: 44 },
  { location: 'Klang', monthlySlots: 30 },
  { location: 'Kuala Langat', monthlySlots: 32 },
  { location: 'Ulu Langat', monthlySlots: 24 },
  { location: 'Sepang', monthlySlots: 20 },
  { location: 'Putrajaya', monthlySlots: 22 },
];
