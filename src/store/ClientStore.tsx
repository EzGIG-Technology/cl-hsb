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

interface ClientStoreValue {
  clients: Client[];
  clientById: (id: string) => Client | undefined;
  updateAddress: (id: string, address: string, location: string) => void;
  addPackageToClient: (id: string, packageId: string) => void;
  removePackageFromClient: (id: string, packageId: string) => void;
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
      updateAddress: (id, address, location) =>
        setClients((prev) => prev.map((c) => (c.id === id ? { ...c, address, location } : c))),
      addPackageToClient: (id, packageId) =>
        setClients((prev) =>
          prev.map((c) => (c.id === id && !c.packageIds.includes(packageId) ? { ...c, packageIds: [...c.packageIds, packageId] } : c)),
        ),
      removePackageFromClient: (id, packageId) =>
        setClients((prev) =>
          prev.map((c) => (c.id === id ? { ...c, packageIds: c.packageIds.filter((p) => p !== packageId) } : c)),
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
