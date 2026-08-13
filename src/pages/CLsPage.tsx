import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, ShieldAlert, ShieldX, Phone } from 'lucide-react';
import { PageShell } from '../components/PageShell';
import { Card, Badge, Avatar } from '../components/ui';
import { useCLStore } from '../store/CLStore';
import type { CLStatus } from '../types';

const statusFilters: { label: string; value: CLStatus | 'all' | 'flagged' }[] = [
  { label: 'All', value: 'all' },
  { label: 'On duty', value: 'on-duty' },
  { label: 'Available', value: 'available' },
  { label: 'On leave', value: 'on-leave' },
  { label: 'Off duty', value: 'off-duty' },
  { label: 'Flagged', value: 'flagged' },
];

export default function CLsPage() {
  const navigate = useNavigate();
  const { cls } = useCLStore();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<CLStatus | 'all' | 'flagged'>('all');

  const counts = useMemo(() => {
    const base: Record<string, number> = { 'on-duty': 0, available: 0, 'on-leave': 0, 'off-duty': 0, flagged: 0 };
    cls.forEach((c) => {
      base[c.status] += 1;
      if (c.flag !== 'none') base.flagged += 1;
    });
    return base;
  }, [cls]);

  const filtered = cls.filter((c) => {
    const matchesQuery = c.name.toLowerCase().includes(query.toLowerCase()) || c.location.toLowerCase().includes(query.toLowerCase());
    const matchesFilter = filter === 'all' ? true : filter === 'flagged' ? c.flag !== 'none' : c.status === filter;
    return matchesQuery && matchesFilter;
  });

  return (
    <PageShell
      title="Confinement Ladies"
      subtitle={`${cls.length} CLs on the roster`}
      searchPlaceholder="Search CL by name or area"
      onSearch={setQuery}
      sidePanel={
        <div className="flex flex-1 flex-col gap-4">
          <div>
            <h3 className="mb-3 text-sm font-semibold text-white/80">Roster status</h3>
            <div className="grid grid-cols-2 gap-3">
              {['on-duty', 'available', 'on-leave', 'off-duty'].map((s) => (
                <div key={s} className="rounded-xl bg-white/10 p-3">
                  <p className="text-2xl font-semibold">{counts[s]}</p>
                  <p className="text-xs capitalize text-white/60">{s.replace('-', ' ')}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl bg-white/10 p-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <ShieldAlert size={16} />
              {counts.flagged} flagged profiles
            </div>
            <p className="mt-1 text-xs text-white/60">CLs tagged as complained or banned. Review before assigning new bookings.</p>
          </div>

          <div className="mt-2 flex-1">
            <h3 className="mb-2 text-sm font-semibold text-white/80">Filter</h3>
            <div className="flex flex-col gap-1">
              {statusFilters.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setFilter(f.value)}
                  className={`rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                    filter === f.value ? 'bg-white font-medium text-brand-maroon-dark' : 'text-white/80 hover:bg-white/10'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      }
    >
      <div className="grid grid-cols-1 gap-4 pt-4 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((cl) => (
          <Card key={cl.id} className="cursor-pointer transition-shadow hover:shadow-md">
            <div onClick={() => navigate(`/cls/${cl.id}`)}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Avatar name={cl.name} color={cl.avatarColor} size={44} />
                  <div>
                    <p className="font-semibold text-brand-ink">{cl.name}</p>
                    <p className="text-xs text-brand-muted">{cl.location}</p>
                  </div>
                </div>
                {cl.flag === 'banned' && <ShieldX size={18} className="text-red-500" />}
                {cl.flag === 'complained' && <ShieldAlert size={18} className="text-brand-amber" />}
              </div>

              <div className="mt-3 flex items-center gap-3 text-sm">
                <Badge status={cl.status}>{cl.status.replace('-', ' ')}</Badge>
                <span className="flex items-center gap-1 text-brand-ink">
                  <Star size={14} className="fill-brand-amber text-brand-amber" />
                  {cl.rating}
                  <span className="text-brand-muted">({cl.reviewCount})</span>
                </span>
              </div>

              <div className="mt-3 flex flex-wrap gap-1.5">
                {cl.specialties.slice(0, 2).map((s) => (
                  <span key={s} className="rounded-full bg-brand-cream px-2 py-1 text-[11px] text-brand-muted">
                    {s}
                  </span>
                ))}
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-black/5 pt-3 text-xs text-brand-muted">
                <span className="flex items-center gap-1">
                  <Phone size={12} /> {cl.phone}
                </span>
                <span>{cl.completedAssignments} completed</span>
              </div>
            </div>
          </Card>
        ))}
        {filtered.length === 0 && <p className="text-sm text-brand-muted">No CLs match your search.</p>}
      </div>
      <div className="h-6" />
    </PageShell>
  );
}
