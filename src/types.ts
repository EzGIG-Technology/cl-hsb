export type PackageCategory = 'postnatal' | 'prenatal';

export interface PackageTier {
  days: number;
  price: number;
}

export interface ScheduledTreatment {
  label: string;
  count: number;
}

export interface Package {
  id: string;
  name: string;
  shortName: string;
  category: PackageCategory;
  theme: 'pink' | 'purple' | 'teal' | 'red' | 'brown' | 'blue' | 'green';
  durationEstimate: string;
  summary: string;
  dailyMotherCare: string[];
  scheduledMotherCare: ScheduledTreatment[];
  babyCare: string[];
  extras: string[];
  notes: string[];
  tiers: PackageTier[];
  sessionPrice?: { perSession: number; bundle: { sessions: number; price: number } };
  transportIncluded: boolean;
  bookingDepositPct: number;
  estimated?: boolean;
}

export type CLStatus = 'on-duty' | 'available' | 'on-leave' | 'off-duty';
export type CLFlag = 'none' | 'complained' | 'banned';
export type CLShift = 'morning' | 'afternoon' | 'both' | 'stay-in' | 'flexible';
export type CLTier = 'Bronze' | 'Silver' | 'Gold' | 'Platinum';

export interface ConfinementLady {
  id: string;
  name: string;
  avatarColor: string;
  phone: string;
  email: string;
  icNumber: string;
  address: string;
  location: string;
  joinedDate: string;
  status: CLStatus;
  rating: number;
  reviewCount: number;
  completedAssignments: number;
  specialties: string[];
  languages: string[];
  yearsExperience: number;
  flag: CLFlag;
  flagNote?: string;
  bio: string;
  shiftAvailability: CLShift;
  passportNumber?: string;
  treatmentPhotoUrl?: string;
}

export function tierForCL(completedAssignments: number): CLTier {
  if (completedAssignments >= 250) return 'Platinum';
  if (completedAssignments >= 150) return 'Gold';
  if (completedAssignments >= 50) return 'Silver';
  return 'Bronze';
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  location: string;
  packageIds: string[];
  dueOrBirthDate: string;
  status: 'active' | 'upcoming' | 'completed';
  notes?: string;
}

export type AssignmentStatus = 'confirmed' | 'pending' | 'completed' | 'cancelled';
export type PaymentStatus = 'pending' | 'in-review' | 'released';

export interface Assignment {
  id: string;
  clientId: string;
  clId: string;
  packageId: string;
  date: string; // yyyy-mm-dd
  startTime: string;
  endTime: string;
  location: string;
  status: AssignmentStatus;
  urgent?: boolean;
  paymentStatus?: PaymentStatus;
}

export interface LocationCapacity {
  location: string;
  monthlySlots: number;
}

export type SlotCadence = 'daily' | 'weekly' | 'monthly';

export interface PackageLocationSlot {
  location: string;
  cadence: SlotCadence;
  slots: number;
}

export interface MessageThread {
  id: string;
  participantName: string;
  participantType: 'cl' | 'client';
  avatarColor: string;
  lastMessage: string;
  lastMessageAt: string;
  unread: number;
  messages: { id: string; from: 'admin' | 'them'; text: string; time: string }[];
}
