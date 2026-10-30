import { useState, type ReactNode } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Star, Phone, Mail, IdCard, Store, Clock, Wallet, Briefcase, Languages, MessageCircle, Pencil, UserX, X, Sparkles, CalendarDays } from 'lucide-react';
import { PageShell } from '../components/PageShell';
import { Card, Avatar, SectionTitle, SpecialtyChip, formatRM } from '../components/ui';
import { useSpaStaffStore } from '../store/SpaStaffStore';
import { useActivityLog } from '../store/ActivityLogContext';
import { SPA_NAME, SPA_ROLES, SPA_SKILLS, spaRoleStyles } from '../data/spaStaff';
import { formatDateLabel } from '../lib/date';
import type { CLStatus, SpaStaff, SpaStaffRole } from '../types';

const statusOptions: CLStatus[] = ['on-duty', 'available', 'on-leave', 'off-duty'];
const shiftLabels: Record<SpaStaff['shift'], string> = { morning: 'Morning', afternoon: 'Afternoon', 'full-day': 'Full day' };
const inputClass = 'w-full rounded-lg border border-black/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-pink';

export default function SpaStaffProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { staffById, updateStatus, updateDetails, removeStaff } = useSpaStaffStore();
  const { logAction } = useActivityLog();
  const [editing, setEditing] = useState(false);
  const [notesDraft, setNotesDraft] = useState<string | null>(null);
  const member = id ? staffById(id) : undefined;

  if (!member) {
    return (
      <PageShell title="Spa staff not found">
        <Link to="/spa" className="text-brand-pink underline">
          Back to Spa Directory
        </Link>
      </PageShell>
    );
  }
  const s = member;

  function handleStatusChange(status: CLStatus) {
    updateStatus(s.id, status);
    logAction('Admin Amy', 'Updated spa staff status', `${s.name} → ${status.replace('-', ' ')}`);
  }

  function toggleSkill(skill: string) {
    const skills = s.skills.includes(skill) ? s.skills.filter((k) => k !== skill) : [...s.skills, skill];
    updateDetails(s.id, { skills });
    logAction('Admin Amy', 'Updated spa staff skills', `${s.name} → ${skills.join(', ') || 'none'}`);
  }

  function handleRemove() {
    if (!window.confirm(`Remove ${s.name} from the spa roster? This can't be undone.`)) return;
    removeStaff(s.id);
    logAction('Admin Amy', 'Removed spa staff', s.name);
    navigate('/spa');
  }

  return (
    <PageShell title={s.name} subtitle={`${s.role} · ${SPA_NAME}`}>
      <button onClick={() => navigate('/spa')} className="mb-4 flex items-center gap-2 text-sm text-brand-muted hover:text-brand-ink">
        <ArrowLeft size={15} /> Back to Spa Directory
      </button>

      <Card className="mb-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Avatar name={s.name} color={s.avatarColor} size={64} />
            <div>
              <div className="flex items-center gap-2">
                <p className="text-lg font-semibold text-brand-ink">{s.name}</p>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${spaRoleStyles[s.role]}`}>{s.role}</span>
              </div>
              <p className="flex items-center gap-1 text-sm text-brand-muted">
                <Store size={13} /> {SPA_NAME}
              </p>
              <div className="mt-1 flex items-center gap-3 text-sm">
                <span className="flex items-center gap-1 text-brand-ink">
                  <Star size={13} className="fill-brand-amber text-brand-amber" /> {s.rating}
                </span>
                <select
                  value={s.status}
                  onChange={(e) => handleStatusChange(e.target.value as CLStatus)}
                  className="rounded-full border border-black/10 bg-brand-cream px-2.5 py-1 text-xs text-brand-ink"
                >
                  {statusOptions.map((o) => (
                    <option key={o} value={o}>
                      {o.replace('-', ' ')}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <a
              href={`https://wa.me/${s.phone.replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 rounded-full bg-brand-green px-3 py-1.5 text-xs font-medium text-white hover:opacity-90"
            >
              <MessageCircle size={13} /> WhatsApp
            </a>
            <button
              onClick={() => setEditing(true)}
              className="flex items-center gap-1.5 rounded-full border border-black/10 px-3 py-1.5 text-xs font-medium text-brand-ink hover:bg-brand-cream"
            >
              <Pencil size={13} /> Edit Profile
            </button>
            <button
              onClick={handleRemove}
              className="flex items-center gap-1.5 rounded-full border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
            >
              <UserX size={13} /> Remove from roster
            </button>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 border-t border-black/5 pt-4 sm:grid-cols-3 lg:grid-cols-6">
          <Stat icon={<Sparkles size={12} />} label="Treatments (month)" value={s.role === 'Front Desk' ? '—' : s.treatmentsThisMonth} />
          <Stat icon={<Star size={12} />} label="Rating" value={s.rating} />
          <Stat icon={<Briefcase size={12} />} label="Experience" value={`${s.yearsExperience} yrs`} />
          <Stat icon={<Clock size={12} />} label="Shift" value={shiftLabels[s.shift]} />
          <Stat icon={<CalendarDays size={12} />} label="Joined" value={formatDateLabel(s.joinedDate) + ' ' + s.joinedDate.slice(0, 4)} />
          <Stat icon={<Wallet size={12} />} label="Monthly salary" value={formatRM(s.monthlySalary)} />
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Card>
          <SectionTitle>Contact &amp; particulars</SectionTitle>
          <div className="space-y-3 text-sm">
            <Row icon={<Phone size={14} />} label="Phone" value={s.phone} />
            <Row icon={<Mail size={14} />} label="Email" value={s.email || '—'} />
            <Row icon={<IdCard size={14} />} label="IC number" value={s.icNumber || '—'} />
            <Row icon={<Languages size={14} />} label="Languages" value={s.languages.join(', ') || '—'} />
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <SectionTitle action={<span className="text-xs text-brand-muted">Tap to add or remove</span>}>Spa treatments &amp; skills</SectionTitle>
          {s.skills.length > 0 ? (
            <div className="mb-4 flex flex-wrap gap-1.5">
              {s.skills.map((k) => (
                <SpecialtyChip key={k} label={k} />
              ))}
            </div>
          ) : (
            <p className="mb-4 text-sm text-brand-muted">No skills recorded yet.</p>
          )}
          <div className="flex flex-wrap gap-1.5 border-t border-black/5 pt-3">
            {SPA_SKILLS.map((k) => {
              const on = s.skills.includes(k);
              return (
                <button
                  key={k}
                  onClick={() => toggleSkill(k)}
                  className={`rounded-full px-2.5 py-1 text-xs transition-colors ${
                    on ? 'bg-brand-green text-white' : 'border border-black/10 bg-white text-brand-muted hover:bg-brand-cream'
                  }`}
                >
                  {on ? '✓ ' : '+ '}
                  {k}
                </button>
              );
            })}
          </div>
        </Card>

        <Card className="lg:col-span-3">
          <SectionTitle>Admin notes</SectionTitle>
          <textarea
            value={notesDraft ?? s.notes ?? ''}
            onChange={(e) => setNotesDraft(e.target.value)}
            rows={3}
            placeholder="Training, leave arrangements, customer feedback…"
            className={inputClass}
          />
          {notesDraft !== null && notesDraft !== (s.notes ?? '') && (
            <div className="mt-2 flex justify-end gap-2">
              <button onClick={() => setNotesDraft(null)} className="rounded-full px-3 py-1.5 text-xs text-brand-muted hover:bg-brand-cream">
                Cancel
              </button>
              <button
                onClick={() => {
                  updateDetails(s.id, { notes: notesDraft });
                  logAction('Admin Amy', 'Updated spa staff notes', s.name);
                  setNotesDraft(null);
                }}
                className="rounded-full bg-brand-pink px-3 py-1.5 text-xs font-medium text-white"
              >
                Save notes
              </button>
            </div>
          )}
        </Card>
      </div>

      {editing && <EditSpaStaffModal staff={s} onClose={() => setEditing(false)} />}
      <div className="h-6" />
    </PageShell>
  );
}

function Stat({ icon, label, value }: { icon: ReactNode; label: string; value: ReactNode }) {
  return (
    <div className="rounded-xl bg-brand-cream p-3">
      <p className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-brand-muted">
        {icon} {label}
      </p>
      <p className="mt-1 text-base font-semibold text-brand-ink">{value}</p>
    </div>
  );
}

function Row({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="mt-0.5 text-brand-muted">{icon}</span>
      <div>
        <p className="text-xs text-brand-muted">{label}</p>
        <p className="text-brand-ink">{value}</p>
      </div>
    </div>
  );
}

function EditSpaStaffModal({ staff, onClose }: { staff: SpaStaff; onClose: () => void }) {
  const { updateDetails } = useSpaStaffStore();
  const { logAction } = useActivityLog();
  const [phone, setPhone] = useState(staff.phone);
  const [email, setEmail] = useState(staff.email);
  const [icNumber, setIcNumber] = useState(staff.icNumber);
  const [role, setRole] = useState<SpaStaffRole>(staff.role);
  const [shift, setShift] = useState<SpaStaff['shift']>(staff.shift);
  const [languages, setLanguages] = useState(staff.languages.join(', '));
  const [years, setYears] = useState(String(staff.yearsExperience));
  const [salary, setSalary] = useState(String(staff.monthlySalary));

  function save() {
    updateDetails(staff.id, {
      phone: phone.trim(),
      email: email.trim(),
      icNumber: icNumber.trim(),
      role,
      shift,
      languages: languages.split(',').map((l) => l.trim()).filter(Boolean),
      yearsExperience: Number(years) || 0,
      monthlySalary: Number(salary) || 0,
    });
    logAction('Admin Amy', 'Edited spa staff profile', staff.name);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-black/5 p-4">
          <p className="text-sm font-semibold text-brand-ink">Edit {staff.name}</p>
          <button onClick={onClose} className="text-brand-muted hover:text-brand-ink">
            <X size={18} />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3 p-5">
          <Field label="Role">
            <select value={role} onChange={(e) => setRole(e.target.value as SpaStaffRole)} className={inputClass}>
              {SPA_ROLES.map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
          </Field>
          <Field label="Phone">
            <input value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} />
          </Field>
          <Field label="Email">
            <input value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
          </Field>
          <Field label="IC number">
            <input value={icNumber} onChange={(e) => setIcNumber(e.target.value)} className={inputClass} />
          </Field>
          <Field label="Shift">
            <select value={shift} onChange={(e) => setShift(e.target.value as SpaStaff['shift'])} className={inputClass}>
              {Object.entries(shiftLabels).map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Years of experience">
            <input type="number" min={0} value={years} onChange={(e) => setYears(e.target.value)} className={inputClass} />
          </Field>
          <Field label="Monthly salary (RM)">
            <input type="number" min={0} value={salary} onChange={(e) => setSalary(e.target.value)} className={inputClass} />
          </Field>
          <div className="col-span-2">
            <Field label="Languages (comma-separated)">
              <input value={languages} onChange={(e) => setLanguages(e.target.value)} className={inputClass} />
            </Field>
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 border-t border-black/5 p-4">
          <button onClick={onClose} className="rounded-full px-4 py-2 text-sm text-brand-muted hover:bg-brand-cream">
            Cancel
          </button>
          <button onClick={save} className="rounded-full bg-brand-pink px-4 py-2 text-sm font-medium text-white">
            Save changes
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-brand-muted">{label}</label>
      {children}
    </div>
  );
}
