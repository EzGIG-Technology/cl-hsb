import { useMemo, useState } from 'react';
import { PageShell } from '../components/PageShell';
import { OperationsMap } from '../components/OperationsMap';
import { Card, Badge, Avatar, SectionTitle } from '../components/ui';
import { useCLStore } from '../store/CLStore';
import { locationTotals } from '../data/reports';

export default function MapPage() {
  const { cls } = useCLStore();
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);

  const totalCount = locationTotals.reduce((acc, l) => acc + l.count, 0);

  const filteredCLs = useMemo(() => {
    if (!selectedLocation) return cls;
    return cls.filter((c) => c.location.toLowerCase().includes(selectedLocation.toLowerCase()));
  }, [cls, selectedLocation]);

  return (
    <PageShell
      title="Operations map"
      subtitle="Live view of CL totals across Selangor & Kuala Lumpur."
      sidePanel={
        <div className="flex flex-1 flex-col gap-4">
          <div className="rounded-2xl bg-white/10 p-4 text-center">
            <p className="text-3xl font-semibold">{totalCount}</p>
            <p className="text-xs text-white/60">CL totals across all tracked areas</p>
          </div>

          <div className="flex-1">
            <h3 className="mb-2 text-sm font-semibold text-white/80">By location</h3>
            <div className="space-y-1">
              <button
                onClick={() => setSelectedLocation(null)}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors ${
                  !selectedLocation ? 'bg-white font-medium text-brand-maroon-dark' : 'text-white/80 hover:bg-white/10'
                }`}
              >
                All areas
                <span>{totalCount}</span>
              </button>
              {locationTotals
                .slice()
                .sort((a, b) => b.count - a.count)
                .map((loc) => (
                  <button
                    key={loc.name}
                    onClick={() => setSelectedLocation(loc.name)}
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors ${
                      selectedLocation === loc.name ? 'bg-white font-medium text-brand-maroon-dark' : 'text-white/80 hover:bg-white/10'
                    }`}
                  >
                    {loc.name}
                    <span>{loc.count}</span>
                  </button>
                ))}
            </div>
          </div>
        </div>
      }
    >
      <div className="grid grid-cols-1 gap-5 pt-4 xl:grid-cols-[1.4fr_1fr]">
        <Card className="!p-3">
          <div className="h-[480px]">
            <OperationsMap />
          </div>
        </Card>

        <Card className="!p-0 overflow-hidden">
          <div className="p-5 pb-0">
            <SectionTitle>{selectedLocation ?? 'All'} CLs</SectionTitle>
          </div>
          <div className="scrollbar-thin max-h-[460px] space-y-2 overflow-y-auto p-5 pt-2">
            {filteredCLs.map((cl) => (
              <div key={cl.id} className="flex items-center gap-3 rounded-xl border border-black/5 p-2.5">
                <Avatar name={cl.name} color={cl.avatarColor} size={34} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-brand-ink">{cl.name}</p>
                  <p className="truncate text-xs text-brand-muted">{cl.location}</p>
                </div>
                <Badge status={cl.status}>{cl.status.replace('-', ' ')}</Badge>
              </div>
            ))}
            {filteredCLs.length === 0 && <p className="text-sm text-brand-muted">No CLs found in this area.</p>}
          </div>
        </Card>
      </div>
      <div className="h-6" />
    </PageShell>
  );
}
