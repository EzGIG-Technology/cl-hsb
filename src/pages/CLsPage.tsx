import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, ShieldAlert, ShieldX, UserPlus, X, Phone, MapPin, IdCard, Mail } from 'lucide-react';
import { PageShell } from '../components/PageShell';
import { Card, Badge, Avatar } from '../components/ui';
import { useCLStore } from '../store/CLStore';
import { useActivityLog } from '../store/ActivityLogContext';
import { leaderboardRank } from '../lib/clMetrics';
import { tierForCL, staffPath, staffTypeLabels, type CLStatus, type Staff, type StaffType } from '../types';

const statusFilters: { label: string; value: CLStatus | 'all' | 'flagged' }[] = [
  { label: 'All', value: 'all' },
  { label: 'On duty', value: 'on-duty' },
  { label: 'Available', value: 'available' },
  { label: 'On leave', value: 'on-leave' },
  { label: 'Off duty', value: 'off-duty' },
  { label: 'Flagged', value: 'flagged' },
];

const tierStyles: Record<string, string> = {
  Bronze: 'bg-brand-amber-light text-brand-amber',
  Silver: 'bg-brand-lavender-light text-brand-lavender',
  Gold: 'bg-brand-amber text-white',
  Platinum: 'bg-brand-pink-light text-brand-pink',
};

const placeLabels = ['1st place', '2nd place', '3rd place'];

function pointsFor(cl: Staff) {
  return cl.completedAssignments * 12 + Math.round(cl.rating * 40);
}

const inputCls = 'w-full rounded-lg bg-brand-cream px-3 py-2 text-sm text-brand-ink focus:outline-none focus:ring-2 focus:ring-brand-pink';

const directoryCopy: Record<StaffType, { subtitle: string; addLabel: string; modalTitle: string; areaHint: string }> = {
  cl: {
    subtitle: 'Home service and prenatal & postnatal care at customers’ homes',
    addLabel: 'Add CL',
    modalTitle: 'Add new CL',
    areaHint: 'Where she lives. Used to match her to nearby home-service bookings.',
  },
  spa: {
    subtitle: 'Working in the spa at Bangi Sentral',
    addLabel: 'Add spa staff',
    modalTitle: 'Add new spa staff',
    areaHint: 'Where she lives.',
  },
};

/** One directory per staff type: the CL directory (/cls) and the Spa directory (/spa). */
export default function CLsPage({ staffType }: { staffType: StaffType }) {
  const navigate = useNavigate();
  const { cls: allStaff, addCL } = useCLStore();
  const cls = useMemo(() => allStaff.filter((c) => c.staffType === staffType), [allStaff, staffType]);
  const labels = staffTypeLabels[staffType];
  const copy = directoryCopy[staffType];
  const { logAction } = useActivityLog();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<CLStatus | 'all' | 'flagged'>('all');
  const [showAdd, setShowAdd] = useState(false);

  function handleAdd(input: { name: string; phone: string; location: string; icNumber: string; email?: string }) {
    const cl = addCL({ ...input, staffType });
    logAction('Front Desk', `Added new ${labels.one === 'CL' ? 'CL' : 'spa staff'}`, cl.name);
    setShowAdd(false);
    navigate(staffPath(cl));
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
      title={labels.directory}
      subtitle={`${copy.subtitle}. ${cls.length} on the roster · ${counts.flagged} flagged for review.`}
      searchPlaceholder={`Search ${labels.many} by name or area`}
      onSearch={setQuery}
      headerAction={
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-1.5 rounded-full bg-brand-pink px-4 py-2 text-sm font-medium text-white hover:bg-brand-pink-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink focus-visible:ring-offset-2"
        >
          <UserPlus size={15} /> {copy.addLabel}
        </button>
      }
    >
      {top3.length > 0 && (
        <Card className="p-6">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-lg font-semibold text-brand-ink">Leaderboard</h2>
            <p className="text-sm text-brand-muted">Points from completed sessions and rating</p>
          </div>
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-[1.4fr_1fr_1fr] sm:items-end">
            {top3.map((cl, i) => {
              const tier = tierForCL(cl.completedAssignments);
              const leader = i === 0;
              return (
                <button
                  key={cl.id}
                  onClick={() => navigate(staffPath(cl))}
                  className={`flex items-center gap-4 rounded-2xl p-4 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink ${
                    leader ? 'bg-brand-pink-light hover:bg-brand-pink-light/70' : 'bg-brand-cream hover:bg-brand-pink-light/50'
                  }`}
                >
                  <Avatar name={cl.name} color={cl.avatarColor} size={leader ? 64 : 44} />
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm ${leader ? 'font-medium text-brand-pink' : 'text-brand-muted'}`}>{placeLabels[i]}</p>
                    <p className={`truncate font-semibold text-brand-ink ${leader ? 'text-lg' : 'text-base'}`}>{cl.name}</p>
                    <p
                      className={`mt-1 font-semibold tracking-tight text-brand-ink ${leader ? 'text-4xl' : 'text-2xl'}`}
                    >
                      {pointsFor(cl).toLocaleString()}
                      <span className="ml-1.5 text-sm font-normal tracking-normal text-brand-muted">pts</span>
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-brand-ink">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${tierStyles[tier]}`}>{tier}</span>
                      <span className="flex items-center gap-1">
                        <Star size={13} className="fill-brand-amber text-brand-amber" /> {cl.rating}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </Card>
      )}

      <div className="mt-8 mb-4 flex flex-wrap gap-2">
        {statusFilters.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink ${
              filter === f.value ? 'bg-brand-pink text-white' : 'bg-white text-brand-ink hover:bg-brand-pink-light'
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
              <tr className="text-left text-sm text-brand-muted">
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
                return (
                  <tr key={cl.id} className="border-t border-black/5 hover:bg-brand-cream/60">{/* taste-skill-ignore: table row */}
                    <td className="flex items-center gap-2 px-5 py-3">
                      <Avatar name={cl.name} color={cl.avatarColor} size={28} />
                      <span className="text-brand-ink">{cl.name}</span>
                      {cl.flag === 'banned' && <ShieldX size={14} className="text-red-500" aria-label="Banned" />}
                      {cl.flag === 'complained' && <ShieldAlert size={14} className="text-brand-amber" aria-label="Complaint on file" />}
                    </td>
                    <td className="px-5 py-3 text-brand-ink">{cl.phone}</td>
                    <td className="px-5 py-3 text-brand-ink">{cl.location}</td>
                    <td className="px-5 py-3">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${tierStyles[tier]}`}>{tier}</span>
                    </td>
                    <td className="px-5 py-3 text-brand-ink">{pointsFor(cl).toLocaleString()}</td>
                    <td className="px-5 py-3">
                      <span className="flex items-center gap-1 text-brand-ink">
                        <Star size={12} className="fill-brand-amber text-brand-amber" /> {cl.rating}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <Badge status={cl.status}>{cl.status.replace('-', ' ')}</Badge>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button onClick={() => navigate(staffPath(cl))} className="text-sm font-medium text-brand-pink hover:underline">
                        View
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-5 py-6 text-center text-sm text-brand-muted">
                    No {labels.many} match your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="h-2" />
      </Card>
      {showAdd && <AddStaffModal title={copy.modalTitle} areaHint={copy.areaHint} onClose={() => setShowAdd(false)} onSubmit={handleAdd} />}
      <div className="h-6" />
    </PageShell>
  );
}

function AddStaffModal({
  title,
  areaHint,
  onClose,
  onSubmit,
}: {
  title: string;
  areaHint: string;
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
      <div className="w-full max-w-sm rounded-2xl bg-white shadow-xl">{/* taste-skill-ignore: overlay */}
        <div className="flex items-center justify-between px-6 pt-6">
          <h2 className="text-lg font-semibold text-brand-ink">{title}</h2>
          <button onClick={onClose} className="rounded-full p-1 text-brand-muted hover:bg-brand-cream hover:text-brand-ink" aria-label="Close">
            <X size={18} />
          </button>
        </div>
        <div className="space-y-4 px-6 pt-5">
          <div>
            <label className="mb-1 block text-sm text-brand-muted">Full name *</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nurul Huda binti Ismail" className={inputCls} />
          </div>
          <div>
            <label className="mb-1 flex items-center gap-1.5 text-sm text-brand-muted">
              <Phone size={13} /> Phone number *
            </label>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+60 12-345 6789" className={inputCls} />
          </div>
          <div>
            <label className="mb-1 flex items-center gap-1.5 text-sm text-brand-muted">
              <IdCard size={13} /> IC number *
            </label>
            <input value={icNumber} onChange={(e) => setIcNumber(e.target.value)} placeholder="900101-10-1234" className={inputCls} />
          </div>
          <div>
            <label className="mb-1 flex items-center gap-1.5 text-sm text-brand-muted">
              <MapPin size={13} /> Base area *
            </label>
            <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Bandar Baru Bangi" className={inputCls} />
            <p className="mt-1 text-xs text-brand-muted">{areaHint}</p>
          </div>
          <div>
            <label className="mb-1 flex items-center gap-1.5 text-sm text-brand-muted">
              <Mail size={13} /> Email
            </label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@honeyspabangi.my" className={inputCls} />
          </div>
          <p className="text-sm text-brand-muted">Address, languages, experience, bio and specialties can be filled in on her profile next.</p>
        </div>
        <div className="flex items-center justify-end gap-2 p-6">
          <button onClick={onClose} className="rounded-full bg-brand-cream px-4 py-2 text-sm text-brand-ink hover:bg-brand-pink-light">
            Cancel
          </button>
          <button
            disabled={!canSubmit}
            onClick={() => onSubmit({ name: name.trim(), phone: phone.trim(), location: location.trim(), icNumber: icNumber.trim(), email: email.trim() || undefined })}
            className="rounded-full bg-brand-pink px-4 py-2 text-sm font-medium text-white hover:bg-brand-pink-dark disabled:opacity-30"
          >
            Add &amp; complete profile
          </button>
        </div>
      </div>
    </div>
  );
}
