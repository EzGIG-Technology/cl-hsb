import { useMemo, useState } from 'react';
import { PageShell } from '../components/PageShell';
import { OperationsMap } from '../components/OperationsMap';
import { Card, Badge, Avatar, SectionTitle } from '../components/ui';
import { useCLStore } from '../store/CLStore';
import { useSettings } from '../store/SettingsContext';
import { locationTotals } from '../data/reports';

export default function MapPage() {
  const { cls } = useCLStore();
  const { locationCapacity } = useSettings();
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);

  const capFor = (name: string) => locationCapacity.find((l) => l.location === name)?.monthlySlots;
  // locationTotals.count = customers on the books who live in each area
  const totalClients = locationTotals.reduce((acc, l) => acc + l.count, 0);
  const sortedAreas = locationTotals.slice().sort((a, b) => b.count - a.count);
  const topCount = sortedAreas[0]?.count ?? 1;
  const selectedCount = selectedLocation ? locationTotals.find((l) => l.name === selectedLocation)?.count ?? 0 : totalClients;

  const filteredStaffList = useMemo(() => {
    if (!selectedLocation) return cls;
    return cls.filter((c) => c.location.toLowerCase().includes(selectedLocation.toLowerCase()));
  }, [cls, selectedLocation]);

  return (
    <PageShell title="Customer map" subtitle="Where our customers live around Bangi Sentral, for planning home-service sessions.">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr] 2xl:grid-cols-[280px_1fr_340px]">
        <Card className="p-6">
          <p className="text-sm text-brand-muted">{selectedLocation ? `Customers in ${selectedLocation}` : 'Customers, all areas'}</p>
          <p className="mt-2 text-4xl font-semibold tracking-tight text-brand-ink">{selectedCount}</p>
          {selectedLocation && <p className="mt-1 text-sm text-brand-muted">of {totalClients} customers in total</p>}

          <div className="mt-6 space-y-1">
            <button
              onClick={() => setSelectedLocation(null)}
              className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink ${
                !selectedLocation ? 'bg-brand-pink-light font-medium text-brand-pink-dark' : 'text-brand-ink hover:bg-brand-cream'
              }`}
            >
              All areas
              <span>{totalClients}</span>
            </button>
            {sortedAreas.map((loc) => {
              const cap = capFor(loc.name);
              const nearFull = cap ? loc.count / cap >= 0.9 : false;
              const active = selectedLocation === loc.name;
              return (
                <button
                  key={loc.name}
                  onClick={() => setSelectedLocation(loc.name)}
                  className={`w-full rounded-xl px-3 py-2.5 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink ${
                    active ? 'bg-brand-pink-light text-brand-pink-dark' : 'text-brand-ink hover:bg-brand-cream'
                  }`}
                >
                  <span className="flex items-center justify-between gap-2">
                    <span className={active ? 'font-medium' : ''}>{loc.name}</span>
                    <span className="font-medium">{loc.count}</span>
                  </span>
                  <span className="mt-1.5 block h-1.5 overflow-hidden rounded-full bg-brand-cream">
                    <span
                      className={`block h-full rounded-full ${active ? 'bg-brand-pink' : 'bg-brand-lavender'}`}
                      style={{ width: `${(loc.count / topCount) * 100}%` }}
                    />
                  </span>
                  {nearFull && <span className="mt-1 block text-xs text-brand-amber">Near capacity ({cap} slots a month)</span>}
                </button>
              );
            })}
          </div>
        </Card>

        <Card className="p-3">
          <div className="h-[520px] overflow-hidden rounded-xl">
            <OperationsMap />
          </div>
          <p className="px-2 pb-1 pt-3 text-sm text-brand-muted">
            Each pin shows how many customers live in that area. Bigger, magenta pins are where most of our customers are.
          </p>
        </Card>

        <Card className="p-6 lg:col-span-2 2xl:col-span-1">
          <SectionTitle>{selectedLocation ? `Staff in ${selectedLocation}` : 'All staff'}</SectionTitle>
          <p className="-mt-2 mb-4 text-sm text-brand-muted">Who is based nearby for home-service sessions.</p>
          <div className="scrollbar-thin max-h-[460px] space-y-2 overflow-y-auto">
            {filteredStaffList.map((t) => (
              <div key={t.id} className="flex items-center gap-3 rounded-xl bg-brand-cream p-3">
                <Avatar name={t.name} color={t.avatarColor} size={36} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-brand-ink">{t.name}</p>
                  <p className="truncate text-sm text-brand-muted">{t.location}</p>
                </div>
                <Badge status={t.status}>
                  <span className="capitalize">{t.status.replace('-', ' ')}</span>
                </Badge>
              </div>
            ))}
            {filteredStaffList.length === 0 && <p className="text-sm text-brand-muted">No staff based in this area yet.</p>}
          </div>
        </Card>
      </div>
      <div className="h-6" />
    </PageShell>
  );
}
