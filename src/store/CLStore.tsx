import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { confinementLadies as seedCLs } from '../data/team';
import type { CLFlag, CLStatus, ConfinementLady } from '../types';

const STORAGE_KEY = 'nrmc-cls-v1';

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
  updateDetails: (id: string, patch: Partial<Pick<ConfinementLady, 'phone' | 'email' | 'address' | 'icNumber' | 'yearsExperience' | 'languages' | 'bio' | 'specialties'>>) => void;
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
          bio: '',
          shiftAvailability: input.shiftAvailability ?? 'flexible',
        };
        setCLs((prev) => [...prev, newCL]);
        return newCL;
      },
      updateDetails: (id, patch) => setCLs((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c))),
      updateFlag: (id, flag, note) =>
        setCLs((prev) => prev.map((c) => (c.id === id ? { ...c, flag, flagNote: flag === 'none' ? undefined : note } : c))),
      updateStatus: (id, status) => setCLs((prev) => prev.map((c) => (c.id === id ? { ...c, status } : c))),
      updateTreatmentPhoto: (id, dataUrl) =>
        setCLs((prev) => prev.map((c) => (c.id === id ? { ...c, treatmentPhotoUrl: dataUrl } : c))),
      updatePassport: (id, passportNumber) => setCLs((prev) => prev.map((c) => (c.id === id ? { ...c, passportNumber } : c))),
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
