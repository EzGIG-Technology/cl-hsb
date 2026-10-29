export type PackageCategory = 'massage' | 'prenatal' | 'treatment' | 'promo';

/** One bookable length of a treatment, e.g. 60 min for RM 80. */
export interface PackageTier {
  minutes: number;
  price: number;
}

export interface Package {
  id: string;
  name: string;
  shortName: string;
  category: PackageCategory;
  theme: 'pink' | 'purple' | 'teal' | 'red' | 'brown' | 'blue' | 'green';
  durationEstimate: string;
  summary: string;
  /** What the therapist does in a session, in order. Doubles as the in-app session checklist. */
  treatmentSteps: string[];
  extras: string[];
  notes: string[];
  tiers: PackageTier[];
  bookingDepositPct: number;
  /** True when the price is not on Honey Spa's published price list and still needs confirming. */
  estimated?: boolean;
  /** Where the listing and price were sourced from, for the audit trail. */
  source?: string;
}

export type CLStatus = 'on-duty' | 'available' | 'on-leave' | 'off-duty';
export type CLFlag = 'none' | 'complained' | 'banned';
export type CLShift = 'morning' | 'afternoon' | 'both' | 'stay-in' | 'flexible';
export type CLTier = 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
export type PaymentMethod = 'bank-transfer' | 'cash' | 'e-wallet';

export interface Review {
  id: string;
  rating: number;
  text?: string;
  date: string; // yyyy-mm-dd
  clientName: string;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  expiryDate: string; // yyyy-mm-dd
}

export interface LeavePeriod {
  start: string; // yyyy-mm-dd
  end: string; // yyyy-mm-dd
  reason?: string;
}

export interface FlagHistoryEntry {
  date: string; // yyyy-mm-dd
  flag: CLFlag;
  note?: string;
}

export interface Therapist {
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
  reviews: Review[];
  completedAssignments: number;
  specialties: string[];
  languages: string[];
  yearsExperience: number;
  flag: CLFlag;
  flagNote?: string;
  flagHistory: FlagHistoryEntry[];
  bio: string;
  shiftAvailability: CLShift;
  passportNumber?: string;
  treatmentPhotoUrl?: string;
  // Credentialing & compliance
  certifications: Certification[];
  nationality: string;
  workPermitExpiry?: string; // omit for Malaysian citizens
  passportExpiry?: string; // expiry tracking only — never document custody
  // Availability
  leavePeriods: LeavePeriod[];
  // Payroll identity
  bankName?: string;
  bankAccountMasked?: string; // e.g. "•••• 4821" — masked, never a full account number
  paymentMethod?: PaymentMethod;
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
  /** Selected session length (minutes) per package id (e.g. { traditional: 90 }). Absent = the package's first tier. */
  packageMinutes?: Record<string, number>;
  /** The date the client asked to be seen (yyyy-mm-dd); drives the "needs a therapist" urgency on Bookings/Schedule. */
  preferredDate: string;
  status: 'active' | 'upcoming' | 'completed';
  notes?: string;
}

export type AssignmentStatus = 'confirmed' | 'pending' | 'completed' | 'cancelled';
export type PaymentStatus = 'pending' | 'in-review' | 'released';
export type ApprovalStatus = 'approved' | 'rejected';

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
  /** Set once a Superadmin has reviewed the check-in/out selfies + package checklist for a completed session. Absent = awaiting review. */
  approvalStatus?: ApprovalStatus;
  approvalNote?: string;
  /** True once this booking has gone through Reassign/Reschedule at least once — surfaced on the Overview daily activity breakdown. */
  rescheduled?: boolean;
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

export type DisputeSeverity = 'High' | 'Medium';
export type DisputeStatus = 'Open' | 'Resolved';

export interface Dispute {
  id: string;
  date: string;
  clId: string;
  clientId: string;
  issue: string;
  detail: string;
  severity: DisputeSeverity;
  status: DisputeStatus;
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
