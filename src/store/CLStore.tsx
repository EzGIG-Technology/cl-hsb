import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { confinementLadies as seedCLs } from '../data/team';
import { TODAY_STR } from '../lib/date';
import type { CLFlag, CLStatus, ConfinementLady, Review, Certification, LeavePeriod } from '../types';

// v2: added reviews/certifications/nationality/leavePeriods/flagHistory/payroll fields — bumped so
// browsers holding a pre-existing v1 record (old shape, missing these) don't crash on load.
const STORAGE_KEY = 'nrmc-cls-v2';

function loadInitial(): ConfinementLady[] {
  if (typeof window !== 'undefined') {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as ConfinementLady[];
        if (parsed.length) return parsed;
      }
    } catch {
      // fall through to seed
    }
  }
  return seedCLs;
}

const avatarPalette = ['#d94f8c', '#3c6f57', '#c98a3b', '#4f8a6d', '#b13570', '#3b6d8a', '#8b5fbf', '#2f9b87'];

export interface NewCLInput {
  name: string;
  phone: string;
  location: string;
  icNumber?: string;
  email?: string;
  address?: string;
  yearsExperience?: number;
  languages?: string[];
  shiftAvailability?: ConfinementLady['shiftAvailability'];
}

interface CLStoreValue {
  cls: ConfinementLady[];
  clById: (id: string) => ConfinementLady | undefined;
  addCL: (input: NewCLInput) => ConfinementLady;
  updateFlag: (id: string, flag: CLFlag, note?: string) => void;
  updateStatus: (id: string, status: CLStatus) => void;
  updateTreatmentPhoto: (id: string, dataUrl: string | undefined) => void;
  updatePassport: (id: string, passportNumber: string) => void;
  updateDetails: (
    id: string,
    patch: Partial<
      Pick<
        ConfinementLady,
        | 'phone'
        | 'email'
        | 'address'
        | 'icNumber'
        | 'yearsExperience'
        | 'languages'
        | 'bio'
        | 'specialties'
        | 'nationality'
        | 'workPermitExpiry'
        | 'passportExpiry'
        | 'bankName'
        | 'bankAccountMasked'
        | 'paymentMethod'
      >
    >,
  ) => void;
  addReview: (clId: string, review: Omit<Review, 'id'>) => void;
  addCertification: (clId: string, cert: Omit<Certification, 'id'>) => void;
  removeCertification: (clId: string, certId: string) => void;
  addLeavePeriod: (clId: string, period: LeavePeriod) => void;
  removeLeavePeriod: (clId: string, index: number) => void;
  resetToDefaults: () => void;
}

const CLStoreContext = createContext<CLStoreValue | null>(null);

export function CLStoreProvider({ children }: { children: ReactNode }) {
  const [cls, setCLs] = useState<ConfinementLady[]>(loadInitial);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cls));
    } catch {
      // ignore quota errors in demo environment
    }
  }, [cls]);

  const value = useMemo<CLStoreValue>(
    () => ({
      cls,
      clById: (id) => cls.find((c) => c.id === id),
      addCL: (input) => {
        const newCL: ConfinementLady = {
          id: `cl-${Date.now()}`,
          name: input.name,
          avatarColor: avatarPalette[cls.length % avatarPalette.length],
          phone: input.phone,
          email: input.email ?? '',
          icNumber: input.icNumber ?? '',
          address: input.address ?? '',
          location: input.location,
          joinedDate: new Date().toISOString().slice(0, 10),
          status: 'available',
          rating: 5,
          reviewCount: 0,
          completedAssignments: 0,
          specialties: [],
          languages: input.languages ?? ['Bahasa Malaysia'],
          yearsExperience: input.yearsExperience ?? 0,
          flag: 'none',
          flagHistory: [],
          bio: '',
          shiftAvailability: input.shiftAvailability ?? 'flexible',
          reviews: [],
          certifications: [],
          nationality: 'Malaysian',
          leavePeriods: [],
        };
        setCLs((prev) => [...prev, newCL]);
        return newCL;
      },
      updateDetails: (id, patch) => setCLs((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c))),
      updateFlag: (id, flag, note) =>
        setCLs((prev) =>
          prev.map((c) =>
            c.id === id
              ? {
                  ...c,
                  flag,
                  flagNote: flag === 'none' ? undefined : note,
                  flagHistory: [{ date: TODAY_STR, flag, note }, ...c.flagHistory],
                }
              : c,
          ),
        ),
      updateStatus: (id, status) => setCLs((prev) => prev.map((c) => (c.id === id ? { ...c, status } : c))),
      updateTreatmentPhoto: (id, dataUrl) =>
        setCLs((prev) => prev.map((c) => (c.id === id ? { ...c, treatmentPhotoUrl: dataUrl } : c))),
      updatePassport: (id, passportNumber) => setCLs((prev) => prev.map((c) => (c.id === id ? { ...c, passportNumber } : c))),
      addReview: (clId, review) =>
        setCLs((prev) =>
          prev.map((c) => {
            if (c.id !== clId) return c;
            const newReview: Review = { ...review, id: `rev-${Date.now()}` };
            const newCount = c.reviewCount + 1;
            const newRating = Math.round(((c.rating * c.reviewCount + review.rating) / newCount) * 10) / 10;
            return { ...c, reviews: [newReview, ...c.reviews], reviewCount: newCount, rating: newRating };
          }),
        ),
      addCertification: (clId, cert) =>
        setCLs((prev) =>
          prev.map((c) =>
            c.id === clId ? { ...c, certifications: [...c.certifications, { ...cert, id: `cert-${Date.now()}` }] } : c,
          ),
        ),
      removeCertification: (clId, certId) =>
        setCLs((prev) =>
          prev.map((c) => (c.id === clId ? { ...c, certifications: c.certifications.filter((cert) => cert.id !== certId) } : c)),
        ),
      addLeavePeriod: (clId, period) =>
        setCLs((prev) => prev.map((c) => (c.id === clId ? { ...c, leavePeriods: [...c.leavePeriods, period] } : c))),
      removeLeavePeriod: (clId, index) =>
        setCLs((prev) =>
          prev.map((c) => (c.id === clId ? { ...c, leavePeriods: c.leavePeriods.filter((_, i) => i !== index) } : c)),
        ),
      resetToDefaults: () => setCLs(seedCLs),
    }),
    [cls],
  );

  return <CLStoreContext.Provider value={value}>{children}</CLStoreContext.Provider>;
}

export function useCLStore() {
  const ctx = useContext(CLStoreContext);
  if (!ctx) throw new Error('useCLStore must be used within CLStoreProvider');
  return ctx;
}
