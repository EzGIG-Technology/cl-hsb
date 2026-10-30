import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, ShieldAlert, ShieldX, Trophy, UserPlus, X, Phone, MapPin, IdCard, Mail, Users } from 'lucide-react';
import { PageShell } from '../components/PageShell';
import { Card, Badge, Avatar } from '../components/ui';
import { useCLStore } from '../store/CLStore';
import { useActivityLog } from '../store/ActivityLogContext';
import { leaderboardRank } from '../lib/clMetrics';
import { tierForCL, type CLStatus } from '../types';

const statusFilters: { label: string; value: CLStatus | 'all' | 'flagged' }[] = [
  { label: 'All', value: 'all' },
  { label: 'On duty', value: 'on-duty' },
  { label: 'Available', value: 'available' },
  { label: 'On leave', value: 'on-leave' },
  { label: 'Off duty', value: 'off-duty' },
  { label: 'Flagged', value: 'flagged' },
];

const tierStyles: Record<string, string> = {
  Bronze: 'bg-amber-100 text-amber-800',
  Silver: 'bg-gray-200 text-gray-700',
  Gold: 'bg-brand-amber-light text-brand-amber',
  Platinum: 'bg-brand-pink-light text-brand-pink',
};

const podiumStyles = ['border-brand-amber bg-brand-amber-light', 'border-gray-300 bg-gray-100', 'border-amber-700/30 bg-amber-50'];

export default function CLsPage() {
  const navigate = useNavigate();
  const { cls, addCL } = useCLStore();
  const { logAction } = useActivityLog();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<CLStatus | 'all' | 'flagged'>('all');
  const [showAdd, setShowAdd] = useState(false);

  function handleAdd(input: { name: string; phone: string; location: string; icNumber: string; email?: string }) {
    const cl = addCL(input);
    logAction('Admin Amy', 'Added new caregiver', cl.name);
    setShowAdd(false);
    navigate(`/cls/${cl.id}`);
  }

  const counts = useMemo(() => {
    const base: Record<string, number> = { 'on-duty': 0, available: 0, 'on-leave': 0, 'off-duty': 0, flagged: 0 };
    cls.forEach((c) => {
      base[c.status] += 1;
      if (c.flag !== 'none') base.flagged += 1;
    });
    return base;
  }, [cls]);

  const ranked = useMemo(() => leaderboardRank(cls), [cls]);
  const top3 = ranked.slice(0, 3);

  const filtered = cls.filter((c) => {
    const matchesQuery = c.name.toLowerCase().includes(query.toLowerCase()) || c.location.toLowerCase().includes(query.toLowerCase());
    const matchesFilter = filter === 'all' ? true : filter === 'flagged' ? c.flag !== 'none' : c.status === filter;
    return matchesQuery && matchesFilter;
  });

  return (
    <PageShell
      title="CL Directory"
      subtitle={`${cls.length} CLs on the roster — ${counts.flagged} flagged for review`}
      icon={Users}
      accentColor="#d94f8c"
      searchPlaceholder="Search CL by name or area"
      onSearch={setQuery}
      headerAction={
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-1.5 rounded-full bg-brand-pink px-4 py-2 text-sm font-medium text-white hover:bg-brand-pink-dark"
        >
          <UserPlus size={15} /> Add Caregiver
        </button>
      }
    >
      <Card className="mb-5">
        <div className="mb-3 flex items-center gap-2">
          <Trophy size={16} className="text-brand-amber" />
          <h3 className="font-semibold text-brand-ink">Leaderboard — Top 3</h3>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {top3.map((cl, i) => {
            const tier = tierForCL(cl.completedAssignments);
            return (
              <button
                key={cl.id}
                onClick={() => navigate(`/cls/${cl.id}`)}
                className={`rounded-xl border p-3 text-left ${podiumStyles[i]}`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-brand-ink">#{i + 1}</span>
                  <Avatar name={cl.name} color={cl.avatarColor} size={36} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-brand-ink">{cl.name}</p>
                    <p className="text-xs text-brand-muted">{cl.location}</p>
                  </div>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${tierStyles[tier]}`}>{tier}</span>
                  <span className="flex items-center gap-1 text-xs text-brand-ink">
                    <Star size={12} className="fill-brand-amber text-brand-amber" /> {cl.rating}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </Card>

      <div className="mb-4 flex flex-wrap gap-2">
        {statusFilters.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
              filter === f.value ? 'bg-brand-pink text-white' : 'border border-black/10 bg-white text-brand-ink hover:bg-brand-cream'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <Card className="!p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-brand-muted">
                <th className="px-5 py-3 font-medium">Name</th>
                <th className="px-5 py-3 font-medium">Phone</th>
                <th className="px-5 py-3 font-medium">Base area</th>
                <th className="px-5 py-3 font-medium">Tier</th>
                <th className="px-5 py-3 font-medium">Points</th>
                <th className="px-5 py-3 font-medium">Rating</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((cl) => {
                const tier = tierForCL(cl.completedAssignments);
                const points = cl.completedAssignments * 12 + Math.round(cl.rating * 40);
                return (
                  <tr key={cl.id} className="border-t border-black/5 hover:bg-brand-cream/60">
                    <td className="flex items-center gap-2 px-5 py-3">
                      <Avatar name={cl.name} color={cl.avatarColor} size={28} />
                      <span className="text-brand-ink">{cl.name}</span>
                      {cl.flag === 'banned' && <ShieldX size={14} className="text-red-500" />}
                      {cl.flag === 'complained' && <ShieldAlert size={14} className="text-brand-amber" />}
                    </td>
                    <td className="px-5 py-3 text-brand-muted">{cl.phone}</td>
                    <td className="px-5 py-3 text-brand-muted">{cl.location}</td>
                    <td className="px-5 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${tierStyles[tier]}`}>{tier}</span>
                    </td>
                    <td className="px-5 py-3 text-brand-muted">{points.toLocaleString()}</td>
                    <td className="px-5 py-3">
                      <span className="flex items-center gap-1 text-brand-ink">
                        <Star size={12} className="fill-brand-amber text-brand-amber" /> {cl.rating}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <Badge status={cl.status}>{cl.status.replace('-', ' ')}</Badge>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button onClick={() => navigate(`/cls/${cl.id}`)} className="text-xs font-medium text-brand-pink hover:underline">
                        View
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-5 py-6 text-center text-sm text-brand-muted">
                    No CLs match your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="h-2" />
      </Card>
      {showAdd && <AddCaregiverModal onClose={() => setShowAdd(false)} onSubmit={handleAdd} />}
      <div className="h-6" />
    </PageShell>
  );
}

function AddCaregiverModal({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (input: { name: string; phone: string; location: string; icNumber: string; email?: string }) => void;
}) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [icNumber, setIcNumber] = useState('');
  const [email, setEmail] = useState('');

  const canSubmit = name.trim() && phone.trim() && location.trim() && icNumber.trim();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-black/5 p-4">
          <p className="text-sm font-semibold text-brand-ink">Add new caregiver</p>
          <button onClick={onClose} className="text-brand-muted hover:text-brand-ink">
            <X size={18} />
          </button>
        </div>
        <div className="space-y-3 p-5">
          <div>
            <label className="mb-1 block text-xs font-medium text-brand-muted">Full name *</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nurul Huda binti Ismail" className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-pink" />
          </div>
          <div>
            <label className="mb-1 flex items-center gap-1 text-xs font-medium text-brand-muted">
              <Phone size={11} /> Phone number *
            </label>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+60 12-345 6789" className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-pink" />
          </div>
          <div>
            <label className="mb-1 flex items-center gap-1 text-xs font-medium text-brand-muted">
              <IdCard size={11} /> IC number *
            </label>
            <input value={icNumber} onChange={(e) => setIcNumber(e.target.value)} placeholder="900101-10-1234" className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-pink" />
          </div>
          <div>
            <label className="mb-1 flex items-center gap-1 text-xs font-medium text-brand-muted">
              <MapPin size={11} /> Base location *
            </label>
            <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Shah Alam, Selangor" className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-pink" />
          </div>
          <div>
            <label className="mb-1 flex items-center gap-1 text-xs font-medium text-brand-muted">
              <Mail size={11} /> Email
            </label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@nrmothercare.my" className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-pink" />
          </div>
          <p className="text-xs text-brand-muted">Address, languages, experience, bio, and specialties can be filled in on the caregiver's profile next.</p>
        </div>
        <div className="flex items-center justify-end gap-2 border-t border-black/5 p-4">
          <button onClick={onClose} className="rounded-full px-4 py-2 text-sm text-brand-muted hover:bg-brand-cream">
            Cancel
          </button>
          <button
            disabled={!canSubmit}
            onClick={() => onSubmit({ name: name.trim(), phone: phone.trim(), location: location.trim(), icNumber: icNumber.trim(), email: email.trim() || undefined })}
            className="rounded-full bg-brand-pink px-4 py-2 text-sm font-medium text-white disabled:opacity-30"
          >
            Add &amp; complete profile
          </button>
        </div>
      </div>
    </div>
  );
}
