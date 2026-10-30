import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { spaStaff as seedStaff } from '../data/spaStaff';
import type { CLStatus, SpaStaff } from '../types';

const STORAGE_KEY = 'nrmc-spa-staff-v1';

function loadInitial(): SpaStaff[] {
  if (typeof window !== 'undefined') {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as SpaStaff[];
        if (parsed.length) return parsed;
      }
    } catch {
      // fall through to seed
    }
  }
  return seedStaff;
}

const avatarPalette = ['#d94f8c', '#3c6f57', '#c98a3b', '#4f8a6d', '#b13570', '#3b6d8a', '#8b5fbf', '#2f9b87'];

export interface NewSpaStaffInput {
  name: string;
  phone: string;
  role: SpaStaff['role'];
  outlet: string;
  icNumber?: string;
  email?: string;
  monthlySalary?: number;
}

interface SpaStaffStoreValue {
  staff: SpaStaff[];
  staffById: (id: string) => SpaStaff | undefined;
  addStaff: (input: NewSpaStaffInput) => SpaStaff;
  updateStatus: (id: string, status: CLStatus) => void;
  updateDetails: (
    id: string,
    patch: Partial<Pick<SpaStaff, 'phone' | 'email' | 'icNumber' | 'role' | 'outlet' | 'shift' | 'skills' | 'languages' | 'yearsExperience' | 'monthlySalary' | 'notes'>>,
  ) => void;
  removeStaff: (id: string) => void;
  resetToDefaults: () => void;
}

const SpaStaffStoreContext = createContext<SpaStaffStoreValue | null>(null);

export function SpaStaffStoreProvider({ children }: { children: ReactNode }) {
  const [staff, setStaff] = useState<SpaStaff[]>(loadInitial);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(staff));
    } catch {
      // ignore quota errors in demo environment
    }
  }, [staff]);

  const value = useMemo<SpaStaffStoreValue>(
    () => ({
      staff,
      staffById: (id) => staff.find((s) => s.id === id),
      addStaff: (input) => {
        const newStaff: SpaStaff = {
          id: `spa-${Date.now()}`,
          name: input.name,
          avatarColor: avatarPalette[staff.length % avatarPalette.length],
          role: input.role,
          outlet: input.outlet,
          phone: input.phone,
          email: input.email ?? '',
          icNumber: input.icNumber ?? '',
          joinedDate: new Date().toISOString().slice(0, 10),
          status: 'available',
          rating: 5,
          treatmentsThisMonth: 0,
          skills: [],
          languages: ['Bahasa Malaysia'],
          yearsExperience: 0,
          shift: 'full-day',
          monthlySalary: input.monthlySalary ?? 0,
        };
        setStaff((prev) => [...prev, newStaff]);
        return newStaff;
      },
      updateStatus: (id, status) => setStaff((prev) => prev.map((s) => (s.id === id ? { ...s, status } : s))),
      updateDetails: (id, patch) => setStaff((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s))),
      removeStaff: (id) => setStaff((prev) => prev.filter((s) => s.id !== id)),
      resetToDefaults: () => setStaff(seedStaff),
    }),
    [staff],
  );

  return <SpaStaffStoreContext.Provider value={value}>{children}</SpaStaffStoreContext.Provider>;
}

export function useSpaStaffStore() {
  const ctx = useContext(SpaStaffStoreContext);
  if (!ctx) throw new Error('useSpaStaffStore must be used within SpaStaffStoreProvider');
  return ctx;
}
