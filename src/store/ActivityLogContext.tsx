import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

export interface ActivityLogEntry {
  id: string;
  time: string; // ISO string
  adminName: string;
  action: string;
  details?: string;
}

interface ActivityLogContextValue {
  entries: ActivityLogEntry[];
  logAction: (adminName: string, action: string, details?: string) => void;
  clear: () => void;
}

const STORAGE_KEY = 'honeyspa-activity-log-v2';

const seedEntries: ActivityLogEntry[] = [
  {
    id: 'log-seed-1',
    time: new Date(2026, 7, 13, 9, 12).toISOString(),
    adminName: 'Front Desk',
    action: 'Reassigned staff',
    details: 'Moved Nadia Ismail’s Friday Mix & Match to Mariam Adawiyah',
  },
  {
    id: 'log-seed-2',
    time: new Date(2026, 7, 13, 8, 40).toISOString(),
    adminName: 'Spa Manager',
    action: 'Updated customer address',
    details: 'Izzah Hamid moved to Presint 16, Putrajaya (home service)',
  },
  {
    id: 'log-seed-3',
    time: new Date(2026, 7, 12, 17, 5).toISOString(),
    adminName: 'Front Desk',
    action: 'Logged complaint',
    details: 'DSP-1041 · Husna Nadia, home-service address mix-up',
  },
];

function loadInitial(): ActivityLogEntry[] {
  if (typeof window !== 'undefined') {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw) as ActivityLogEntry[];
    } catch {
      // fall through to seed
    }
  }
  return seedEntries;
}

const ActivityLogContext = createContext<ActivityLogContextValue | null>(null);

export function ActivityLogProvider({ children }: { children: ReactNode }) {
  const [entries, setEntries] = useState<ActivityLogEntry[]>(loadInitial);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    } catch {
      // ignore quota errors in demo environment
    }
  }, [entries]);

  const value = useMemo<ActivityLogContextValue>(
    () => ({
      entries,
      logAction: (adminName, action, details) =>
        setEntries((prev) => [
          { id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, time: new Date().toISOString(), adminName, action, details },
          ...prev,
        ]),
      clear: () => setEntries([]),
    }),
    [entries],
  );

  return <ActivityLogContext.Provider value={value}>{children}</ActivityLogContext.Provider>;
}

export function useActivityLog() {
  const ctx = useContext(ActivityLogContext);
  if (!ctx) throw new Error('useActivityLog must be used within ActivityLogProvider');
  return ctx;
}

export function timeAgo(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}
