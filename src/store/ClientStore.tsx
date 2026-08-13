import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { clients as seedClients } from '../data/clients';
import type { Client } from '../types';

const STORAGE_KEY = 'nrmc-clients-v1';

function loadInitial(): Client[] {
  if (typeof window !== 'undefined') {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Client[];
        if (parsed.length) return parsed;
      }
    } catch {
      // fall through to seed
    }
  }
  return seedClients;
}

export interface NewClientInput {
  name: string;
  phone: string;
  location: string;
  email?: string;
  address?: string;
  dueOrBirthDate?: string;
  notes?: string;
}

interface ClientStoreValue {
  clients: Client[];
  clientById: (id: string) => Client | undefined;
  addClient: (input: NewClientInput) => Client;
  updateAddress: (id: string, address: string, location: string) => void;
  updateDetails: (id: string, patch: Partial<Pick<Client, 'phone' | 'email' | 'dueOrBirthDate' | 'notes' | 'status'>>) => void;
  addPackageToClient: (id: string, packageId: string, days?: number) => void;
  removePackageFromClient: (id: string, packageId: string) => void;
  updatePackageDays: (id: string, packageId: string, days: number) => void;
  resetToDefaults: () => void;
}

const ClientStoreContext = createContext<ClientStoreValue | null>(null);

export function ClientStoreProvider({ children }: { children: ReactNode }) {
  const [clients, setClients] = useState<Client[]>(loadInitial);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(clients));
    } catch {
      // ignore quota errors in demo environment
    }
  }, [clients]);

  const value = useMemo<ClientStoreValue>(
    () => ({
      clients,
      clientById: (id) => clients.find((c) => c.id === id),
      addClient: (input) => {
        const newClient: Client = {
          id: `cli-${Date.now()}`,
          name: input.name,
          phone: input.phone,
          email: input.email ?? '',
          address: input.address ?? '',
          location: input.location,
          packageIds: [],
          dueOrBirthDate: input.dueOrBirthDate ?? '',
          status: 'upcoming',
          notes: input.notes,
        };
        setClients((prev) => [...prev, newClient]);
        return newClient;
      },
      updateAddress: (id, address, location) =>
        setClients((prev) => prev.map((c) => (c.id === id ? { ...c, address, location } : c))),
      updateDetails: (id, patch) => setClients((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c))),
      addPackageToClient: (id, packageId, days) =>
        setClients((prev) =>
          prev.map((c) =>
            c.id === id && !c.packageIds.includes(packageId)
              ? {
                  ...c,
                  packageIds: [...c.packageIds, packageId],
                  packageDays: days ? { ...c.packageDays, [packageId]: days } : c.packageDays,
                }
              : c,
          ),
        ),
      removePackageFromClient: (id, packageId) =>
        setClients((prev) =>
          prev.map((c) => (c.id === id ? { ...c, packageIds: c.packageIds.filter((p) => p !== packageId) } : c)),
        ),
      updatePackageDays: (id, packageId, days) =>
        setClients((prev) =>
          prev.map((c) => (c.id === id ? { ...c, packageDays: { ...c.packageDays, [packageId]: days } } : c)),
        ),
      resetToDefaults: () => setClients(seedClients),
    }),
    [clients],
  );

  return <ClientStoreContext.Provider value={value}>{children}</ClientStoreContext.Provider>;
}

export function useClientStore() {
  const ctx = useContext(ClientStoreContext);
  if (!ctx) throw new Error('useClientStore must be used within ClientStoreProvider');
  return ctx;
}
