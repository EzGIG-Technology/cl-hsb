import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { packages as defaultPackages } from '../data/packages';
import { locationCapacity as defaultLocationCapacity } from '../data/capacity';
import { locationTotals } from '../data/reports';
import type { LocationCapacity, Package, PackageLocationSlot, PackageTier, SlotCadence } from '../types';

function defaultPackageAvailability(): PackageLocationSlot[] {
  return locationTotals.map((l) => ({ location: l.name, cadence: 'weekly' as SlotCadence, slots: Math.max(2, Math.round(l.count / 8)) }));
}

interface CompanyProfile {
  name: string;
  tagline: string;
  phone: string;
  whatsapp: string;
  address: string;
  hours: string;
  instagram: string;
  facebook: string;
  email: string;
  logoDataUrl?: string;
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
  locationCapacity: LocationCapacity[];
  packageAvailability: Record<string, PackageLocationSlot[]>;
}

interface SettingsContextValue extends SettingsState {
  packageById: (id: string) => Package | undefined;
  updatePackage: (id: string, patch: Partial<Package>) => void;
  updateTier: (pkgId: string, minutes: number, price: number) => void;
  addTier: (pkgId: string) => void;
  removeTier: (pkgId: string, minutes: number) => void;
  addPackage: () => void;
  deletePackage: (id: string) => void;
  updateCompany: (patch: Partial<CompanyProfile>) => void;
  addAdmin: () => void;
  updateAdmin: (id: string, patch: Partial<AdminUser>) => void;
  removeAdmin: (id: string) => void;
  updateLocationSlots: (location: string, monthlySlots: number) => void;
  getPackageAvailability: (packageId: string) => PackageLocationSlot[];
  updatePackageSlot: (packageId: string, location: string, patch: Partial<Omit<PackageLocationSlot, 'location'>>) => void;
  resetToDefaults: () => void;
}

const STORAGE_KEY = 'honeyspa-settings-v1';

// Public listing details for Honey Spa Bangi, gathered from its social profiles and directory
// listings (see docs/honey-spa-audit.md). The email address is a placeholder: none is published.
const defaultCompany: CompanyProfile = {
  name: 'Honey Spa Bangi',
  tagline: 'Relax | Rejuvenate | Rejoice',
  phone: '012-244 5415',
  whatsapp: '012-244 5415',
  address: '7-53-3, Jalan Medan Pusat Bandar 8A, Seksyen 9, Bangi Sentral, 43650 Bandar Baru Bangi, Selangor',
  hours: 'Daily, 10.30am – 7.30pm',
  instagram: '@honeyspabangi',
  facebook: 'facebook.com/honeyspabangi',
  email: 'hello@honeyspabangi.my',
};

export const ADMIN_ROLES = ['Admin', 'Finance', 'Operations'] as const;

const defaultAdmins: AdminUser[] = [
  { id: 'admin-manager', name: 'Spa Manager', role: 'Admin', phone: '012-244 5415', email: 'manager@honeyspabangi.my' },
  { id: 'admin-frontdesk', name: 'Front Desk', role: 'Operations', phone: '012-244 5415', email: 'frontdesk@honeyspabangi.my' },
  { id: 'admin-finance', name: 'Finance', role: 'Finance', phone: '012-244 5415', email: 'finance@honeyspabangi.my' },
];

function loadInitial(): SettingsState {
  if (typeof window !== 'undefined') {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<SettingsState>;
        if (parsed.packages?.length) {
          return {
            ...parsed,
            locationCapacity: parsed.locationCapacity ?? defaultLocationCapacity,
            packageAvailability: parsed.packageAvailability ?? {},
          } as SettingsState;
        }
      }
    } catch {
      // fall through to defaults
    }
  }
  return { packages: defaultPackages, company: defaultCompany, admins: defaultAdmins, locationCapacity: defaultLocationCapacity, packageAvailability: {} };
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
      updateTier: (pkgId, minutes, price) =>
        setState((s) => ({
          ...s,
          packages: s.packages.map((p) =>
            p.id === pkgId ? { ...p, tiers: p.tiers.map((t) => (t.minutes === minutes ? { ...t, price } : t)) } : p,
          ),
        })),
      addTier: (pkgId) =>
        setState((s) => ({
          ...s,
          packages: s.packages.map((p) => {
            if (p.id !== pkgId) return p;
            const last = p.tiers[p.tiers.length - 1];
            const newTier: PackageTier = { minutes: (last?.minutes ?? 0) + 30, price: (last?.price ?? 0) + 40 };
            return { ...p, tiers: [...p.tiers, newTier] };
          }),
        })),
      removeTier: (pkgId, minutes) =>
        setState((s) => ({
          ...s,
          packages: s.packages.map((p) => (p.id === pkgId ? { ...p, tiers: p.tiers.filter((t) => t.minutes !== minutes) } : p)),
        })),
      addPackage: () =>
        setState((s) => {
          const id = `custom-${Date.now()}`;
          const newPkg: Package = {
            id,
            name: 'New Treatment',
            shortName: 'New',
            category: 'massage',
            theme: 'pink',
            durationEstimate: '60 min',
            summary: 'Describe this treatment…',
            treatmentSteps: [],
            extras: [],
            notes: [],
            tiers: [{ minutes: 60, price: 80 }],
            bookingDepositPct: 0,
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
      updateLocationSlots: (location, monthlySlots) =>
        setState((s) => ({
          ...s,
          locationCapacity: s.locationCapacity.map((l) => (l.location === location ? { ...l, monthlySlots } : l)),
        })),
      getPackageAvailability: (packageId) => state.packageAvailability[packageId] ?? defaultPackageAvailability(),
      updatePackageSlot: (packageId, location, patch) =>
        setState((s) => {
          const current = s.packageAvailability[packageId] ?? defaultPackageAvailability();
          const updated = current.map((slot) => (slot.location === location ? { ...slot, ...patch } : slot));
          return { ...s, packageAvailability: { ...s.packageAvailability, [packageId]: updated } };
        }),
      resetToDefaults: () =>
        setState({
          packages: defaultPackages,
          company: defaultCompany,
          admins: defaultAdmins,
          locationCapacity: defaultLocationCapacity,
          packageAvailability: {},
        }),
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
