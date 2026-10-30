import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, UserPlus, X, Phone, IdCard, Mail, Flower2, Store, Wallet } from 'lucide-react';
import { PageShell } from '../components/PageShell';
import { Card, Badge, Avatar, formatRM } from '../components/ui';
import { useSpaStaffStore, type NewSpaStaffInput } from '../store/SpaStaffStore';
import { useActivityLog } from '../store/ActivityLogContext';
import { SPA_OUTLETS, SPA_ROLES, spaRoleStyles } from '../data/spaStaff';
import type { CLStatus, SpaStaffRole } from '../types';

const statusFilters: { label: string; value: CLStatus | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'On duty', value: 'on-duty' },
  { label: 'Available', value: 'available' },
  { label: 'On leave', value: 'on-leave' },
  { label: 'Off duty', value: 'off-duty' },
];

const inputClass = 'w-full rounded-lg border border-black/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-pink';

export default function SpaStaffPage() {
  const navigate = useNavigate();
  const { staff, addStaff } = useSpaStaffStore();
  const { logAction } = useActivityLog();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<CLStatus | 'all'>('all');
  const [outlet, setOutlet] = useState<string>('all');
  const [showAdd, setShowAdd] = useState(false);

  function handleAdd(input: NewSpaStaffInput) {
    const s = addStaff(input);
    logAction('Admin Amy', 'Added new spa staff', `${s.name} · ${s.role}, ${s.outlet}`);
    setShowAdd(false);
    navigate(`/spa/${s.id}`);
  }

  const outletSummary = useMemo(
    () =>
      SPA_OUTLETS.map((o) => {
        const team = staff.filter((s) => s.outlet === o);
        return {
          outlet: o,
          headcount: team.length,
          onDuty: team.filter((s) => s.status === 'on-duty').length,
          treatments: team.reduce((sum, s) => sum + s.treatmentsThisMonth, 0),
        };
      }),
    [staff],
  );
  const totalSalaries = staff.reduce((sum, s) => sum + s.monthlySalary, 0);

  const filtered = staff.filter((s) => {
    const q = query.toLowerCase();
    const matchesQuery = s.name.toLowerCase().includes(q) || s.outlet.toLowerCase().includes(q) || s.role.toLowerCase().includes(q);
    const matchesFilter = filter === 'all' || s.status === filter;
    const matchesOutlet = outlet === 'all' || s.outlet === outlet;
    return matchesQuery && matchesFilter && matchesOutlet;
  });

  return (
    <PageShell
      title="Spa Directory"
      subtitle={`${staff.length} spa staff across ${SPA_OUTLETS.length} outlets — ${staff.filter((s) => s.status === 'on-duty').length} on duty now`}
      icon={Flower2}
      accentColor="#3c6f57"
      searchPlaceholder="Search spa staff by name, role or outlet"
      onSearch={setQuery}
      headerAction={
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-1.5 rounded-full bg-brand-pink px-4 py-2 text-sm font-medium text-white hover:bg-brand-pink-dark"
        >
          <UserPlus size={15} /> Add Spa Staff
        </button>
      }
    >
      <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {outletSummary.map((o) => (
          <button
            key={o.outlet}
            onClick={() => setOutlet(outlet === o.outlet ? 'all' : o.outlet)}
            className={`rounded-2xl border bg-white p-4 text-left shadow-sm transition-colors ${
              outlet === o.outlet ? 'border-brand-green ring-2 ring-brand-green/20' : 'border-black/5 hover:bg-brand-cream/60'
            }`}
          >
            <p className="flex items-center gap-1.5 text-sm font-semibold text-brand-ink">
              <Store size={14} className="text-brand-green" /> {o.outlet}
            </p>
            <p className="mt-2 text-lg font-semibold text-brand-ink">
              {o.headcount} <span className="text-xs font-normal text-brand-muted">staff · {o.onDuty} on duty</span>
            </p>
            <p className="text-xs text-brand-muted">{o.treatments} treatments this month</p>
          </button>
        ))}
        <Card className="!p-4">
          <p className="flex items-center gap-1.5 text-sm font-semibold text-brand-ink">
            <Wallet size={14} className="text-brand-amber" /> Monthly spa salaries
          </p>
          <p className="mt-2 text-lg font-semibold text-brand-ink">{formatRM(totalSalaries)}</p>
          <p className="text-xs text-brand-muted">Feeds the P&amp;L in Financial Management</p>
        </Card>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
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
        {outlet !== 'all' && (
          <button
            onClick={() => setOutlet('all')}
            className="flex items-center gap-1 rounded-full bg-brand-green-light px-3 py-1.5 text-xs font-medium text-brand-green"
          >
            {outlet} <X size={12} />
          </button>
        )}
      </div>

      <Card className="!p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-brand-muted">
                <th className="px-5 py-3 font-medium">Name</th>
                <th className="px-5 py-3 font-medium">Role</th>
                <th className="px-5 py-3 font-medium">Outlet</th>
                <th className="px-5 py-3 font-medium">Phone</th>
                <th className="px-5 py-3 font-medium">Treatments (month)</th>
                <th className="px-5 py-3 font-medium">Rating</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={s.id} className="border-t border-black/5 hover:bg-brand-cream/60">
                  <td className="flex items-center gap-2 px-5 py-3">
                    <Avatar name={s.name} color={s.avatarColor} size={28} />
                    <span className="text-brand-ink">{s.name}</span>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${spaRoleStyles[s.role]}`}>{s.role}</span>
                  </td>
                  <td className="px-5 py-3 text-brand-muted">{s.outlet}</td>
                  <td className="px-5 py-3 text-brand-muted">{s.phone}</td>
                  <td className="px-5 py-3 text-brand-muted">{s.role === 'Front Desk' ? '—' : s.treatmentsThisMonth}</td>
                  <td className="px-5 py-3">
                    <span className="flex items-center gap-1 text-brand-ink">
                      <Star size={12} className="fill-brand-amber text-brand-amber" /> {s.rating}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <Badge status={s.status}>{s.status.replace('-', ' ')}</Badge>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button onClick={() => navigate(`/spa/${s.id}`)} className="text-xs font-medium text-brand-pink hover:underline">
                      View
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-5 py-6 text-center text-sm text-brand-muted">
                    No spa staff match your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="h-2" />
      </Card>
      {showAdd && <AddSpaStaffModal onClose={() => setShowAdd(false)} onSubmit={handleAdd} />}
      <div className="h-6" />
    </PageShell>
  );
}

function AddSpaStaffModal({ onClose, onSubmit }: { onClose: () => void; onSubmit: (input: NewSpaStaffInput) => void }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [icNumber, setIcNumber] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<SpaStaffRole>('Spa Specialist');
  const [outlet, setOutlet] = useState<string>(SPA_OUTLETS[0]);
  const [salary, setSalary] = useState('');

  const canSubmit = name.trim() && phone.trim() && icNumber.trim();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-black/5 p-4">
          <p className="text-sm font-semibold text-brand-ink">Add new spa staff</p>
          <button onClick={onClose} className="text-brand-muted hover:text-brand-ink">
            <X size={18} />
          </button>
        </div>
        <div className="space-y-3 p-5">
          <div>
            <label className="mb-1 block text-xs font-medium text-brand-muted">Full name *</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nurul Ain binti Hassan" className={inputClass} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-brand-muted">Role *</label>
              <select value={role} onChange={(e) => setRole(e.target.value as SpaStaffRole)} className={inputClass}>
                {SPA_ROLES.map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-brand-muted">Outlet *</label>
              <select value={outlet} onChange={(e) => setOutlet(e.target.value)} className={inputClass}>
                {SPA_OUTLETS.map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="mb-1 flex items-center gap-1 text-xs font-medium text-brand-muted">
              <Phone size={11} /> Phone number *
            </label>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+60 12-345 6789" className={inputClass} />
          </div>
          <div>
            <label className="mb-1 flex items-center gap-1 text-xs font-medium text-brand-muted">
              <IdCard size={11} /> IC number *
            </label>
            <input value={icNumber} onChange={(e) => setIcNumber(e.target.value)} placeholder="900101-10-1234" className={inputClass} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 flex items-center gap-1 text-xs font-medium text-brand-muted">
                <Mail size={11} /> Email
              </label>
              <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@nrmothercare.my" className={inputClass} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-brand-muted">Monthly salary (RM)</label>
              <input type="number" min={0} value={salary} onChange={(e) => setSalary(e.target.value)} placeholder="2500" className={inputClass} />
            </div>
          </div>
          <p className="text-xs text-brand-muted">Skills, shift, languages and notes can be filled in on the staff profile next.</p>
        </div>
        <div className="flex items-center justify-end gap-2 border-t border-black/5 p-4">
          <button onClick={onClose} className="rounded-full px-4 py-2 text-sm text-brand-muted hover:bg-brand-cream">
            Cancel
          </button>
          <button
            disabled={!canSubmit}
            onClick={() =>
              onSubmit({
                name: name.trim(),
                phone: phone.trim(),
                icNumber: icNumber.trim(),
                email: email.trim() || undefined,
                role,
                outlet,
                monthlySalary: Number(salary) || 0,
              })
            }
            className="rounded-full bg-brand-pink px-4 py-2 text-sm font-medium text-white disabled:opacity-30"
          >
            Add &amp; complete profile
          </button>
        </div>
      </div>
    </div>
  );
}
