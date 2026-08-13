import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { packages as defaultPackages } from '../data/packages';
import type { Package, PackageTier } from '../types';

interface CompanyProfile {
  name: string;
  tagline: string;
  adminAkmaPhone: string;
  adminAmyPhone: string;
  address: string;
  email: string;
}

interface AdminUser {
  id: string;
  name: string;
  role: string;
  phone: string;
  email: string;
}

interface SettingsState {
  packages: Package[];
  company: CompanyProfile;
  admins: AdminUser[];
}

interface SettingsContextValue extends SettingsState {
  packageById: (id: string) => Package | undefined;
  updatePackage: (id: string, patch: Partial<Package>) => void;
  updateTier: (pkgId: string, days: number, price: number) => void;
  addTier: (pkgId: string) => void;
  removeTier: (pkgId: string, days: number) => void;
  addPackage: () => void;
  deletePackage: (id: string) => void;
  updateCompany: (patch: Partial<CompanyProfile>) => void;
  addAdmin: () => void;
  updateAdmin: (id: string, patch: Partial<AdminUser>) => void;
  removeAdmin: (id: string) => void;
  resetToDefaults: () => void;
}

const STORAGE_KEY = 'nrmc-settings-v1';

const defaultCompany: CompanyProfile = {
  name: 'NR Mothercare Confinement',
  tagline: 'Sentuhan Tradisional Untuk Para Ibu',
  adminAkmaPhone: '010-249 7650',
  adminAmyPhone: '010-229 7650',
  address: 'Selangor & Kuala Lumpur, Malaysia',
  email: 'hello@nrmothercare.my',
};

const defaultAdmins: AdminUser[] = [
  { id: 'admin-akma', name: 'Admin Akma', role: 'Operations Admin', phone: '010-249 7650', email: 'akma@nrmothercare.my' },
  { id: 'admin-amy', name: 'Admin Amy', role: 'Operations Admin', phone: '010-229 7650', email: 'amy@nrmothercare.my' },
];

function loadInitial(): SettingsState {
  if (typeof window !== 'undefined') {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as SettingsState;
        if (parsed.packages?.length) return parsed;
      }
    } catch {
      // fall through to defaults
    }
  }
  return { packages: defaultPackages, company: defaultCompany, admins: defaultAdmins };
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SettingsState>(loadInitial);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // ignore quota errors in demo environment
    }
  }, [state]);

  const value = useMemo<SettingsContextValue>(
    () => ({
      ...state,
      packageById: (id) => state.packages.find((p) => p.id === id),
      updatePackage: (id, patch) =>
        setState((s) => ({ ...s, packages: s.packages.map((p) => (p.id === id ? { ...p, ...patch } : p)) })),
      updateTier: (pkgId, days, price) =>
        setState((s) => ({
          ...s,
          packages: s.packages.map((p) =>
            p.id === pkgId ? { ...p, tiers: p.tiers.map((t) => (t.days === days ? { ...t, price } : t)) } : p,
          ),
        })),
      addTier: (pkgId) =>
        setState((s) => ({
          ...s,
          packages: s.packages.map((p) => {
            if (p.id !== pkgId) return p;
            const last = p.tiers[p.tiers.length - 1];
            const newTier: PackageTier = { days: (last?.days ?? 0) + 7, price: (last?.price ?? 0) + 500 };
            return { ...p, tiers: [...p.tiers, newTier] };
          }),
        })),
      removeTier: (pkgId, days) =>
        setState((s) => ({
          ...s,
          packages: s.packages.map((p) => (p.id === pkgId ? { ...p, tiers: p.tiers.filter((t) => t.days !== days) } : p)),
        })),
      addPackage: () =>
        setState((s) => {
          const id = `custom-${Date.now()}`;
          const newPkg: Package = {
            id,
            name: 'New Package',
            shortName: 'New',
            category: 'postnatal',
            theme: 'pink',
            durationEstimate: '3 jam',
            summary: 'Describe this package…',
            dailyMotherCare: [],
            scheduledMotherCare: [],
            babyCare: [],
            extras: [],
            notes: [],
            tiers: [{ days: 7, price: 1000 }],
            transportIncluded: true,
            bookingDepositPct: 30,
          };
          return { ...s, packages: [...s.packages, newPkg] };
        }),
      deletePackage: (id) => setState((s) => ({ ...s, packages: s.packages.filter((p) => p.id !== id) })),
      updateCompany: (patch) => setState((s) => ({ ...s, company: { ...s.company, ...patch } })),
      addAdmin: () =>
        setState((s) => ({
          ...s,
          admins: [
            ...s.admins,
            { id: `admin-${Date.now()}`, name: 'New Admin', role: 'Operations Admin', phone: '', email: '' },
          ],
        })),
      updateAdmin: (id, patch) =>
        setState((s) => ({ ...s, admins: s.admins.map((a) => (a.id === id ? { ...a, ...patch } : a)) })),
      removeAdmin: (id) => setState((s) => ({ ...s, admins: s.admins.filter((a) => a.id !== id) })),
      resetToDefaults: () => setState({ packages: defaultPackages, company: defaultCompany, admins: defaultAdmins }),
    }),
    [state],
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
}
