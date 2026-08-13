import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { disputes as seedDisputes } from '../data/disputes';
import type { Dispute } from '../types';

const STORAGE_KEY = 'nrmc-disputes-v1';

function loadInitial(): Dispute[] {
  if (typeof window !== 'undefined') {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Dispute[];
        if (parsed.length) return parsed;
      }
    } catch {
      // fall through to seed
    }
  }
  return seedDisputes;
}

interface DisputeStoreValue {
  disputes: Dispute[];
  disputeById: (id: string) => Dispute | undefined;
  resolveDispute: (id: string) => void;
  resetToDefaults: () => void;
}

const DisputeStoreContext = createContext<DisputeStoreValue | null>(null);

export function DisputeStoreProvider({ children }: { children: ReactNode }) {
  const [disputes, setDisputes] = useState<Dispute[]>(loadInitial);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(disputes));
    } catch {
      // ignore quota errors in demo environment
    }
  }, [disputes]);

  const value = useMemo<DisputeStoreValue>(
    () => ({
      disputes,
      disputeById: (id) => disputes.find((d) => d.id === id),
      resolveDispute: (id) => setDisputes((prev) => prev.map((d) => (d.id === id ? { ...d, status: 'Resolved' } : d))),
      resetToDefaults: () => setDisputes(seedDisputes),
    }),
    [disputes],
  );

  return <DisputeStoreContext.Provider value={value}>{children}</DisputeStoreContext.Provider>;
}

export function useDisputeStore() {
  const ctx = useContext(DisputeStoreContext);
  if (!ctx) throw new Error('useDisputeStore must be used within DisputeStoreProvider');
  return ctx;
}
