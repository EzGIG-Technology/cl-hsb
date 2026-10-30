import { useState, type ReactNode, type ChangeEvent } from 'react';
import { flushSync } from 'react-dom';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Star,
  Phone,
  Mail,
  MapPin,
  ShieldAlert,
  ShieldX,
  ShieldCheck,
  Printer,
  Briefcase,
  Languages,
  Camera,
  MessageCircle,
  FileText,
  UserX,
  Wallet,
  Clock,
  Pencil,
  X,
  Globe,
  BadgeCheck,
  Plus,
  Trash2,
  CalendarOff,
  Landmark,
  History,
} from 'lucide-react';
import { PageShell } from '../components/PageShell';
import { Card, Badge, Avatar, SectionTitle, SpecialtyChip } from '../components/ui';
import { useCLStore } from '../store/CLStore';
import { useAssignmentStore } from '../store/AssignmentStore';
import { useSettings } from '../store/SettingsContext';
import { useClientStore } from '../store/ClientStore';
import { useActivityLog } from '../store/ActivityLogContext';
import { computeCLMetrics, monthlyFinancialsForCL, HOURLY_RATE, HOURS_PER_SESSION } from '../lib/clMetrics';
import { formatTime12, formatDateLabel, TODAY_STR, expiryUrgency, expiryUrgencyStyles, expiryUrgencyLabels } from '../lib/date';
import { tierForCL, staffTypeLabels, type CLFlag, type CLStatus, type Staff, type PaymentMethod } from '../types';

const shiftLabels: Record<string, string> = {
  morning: 'Morning only',
  afternoon: 'Afternoon only',
  both: 'Morning & afternoon',
  'stay-in': 'Full day',
  flexible: 'Flexible',
};

const tierStyles: Record<string, string> = {
  Bronze: 'bg-brand-amber-light text-brand-amber',
  Silver: 'bg-brand-lavender-light text-brand-lavender',
  Gold: 'bg-brand-amber text-white',
  Platinum: 'bg-brand-pink-light text-brand-pink',
};

const pillBase =
  'flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink focus-visible:ring-offset-2';
const pillSecondary = `${pillBase} bg-brand-cream text-brand-ink hover:bg-brand-pink-light`;

const flagOptions: { value: CLFlag; label: string }[] = [
  { value: 'none', label: 'No issues' },
  { value: 'complained', label: 'Complained' },
  { value: 'banned', label: 'Banned' },
];

const statusOptions: CLStatus[] = ['on-duty', 'available', 'on-leave', 'off-duty'];
type DetailTab = 'schedule' | 'active' | 'completed' | 'monthly';

const paymentMethodLabels: Record<PaymentMethod, string> = {
  'bank-transfer': 'Bank transfer',
  cash: 'Cash',
  'e-wallet': 'E-wallet',
};

export default function CLProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { clById, updateFlag, updateStatus } = useCLStore();
  const { assignments } = useAssignmentStore();
  const { packageById } = useSettings();
  const { clientById } = useClientStore();
  const { logAction } = useActivityLog();
  const cl = id ? clById(id) : undefined;
  const [view, setView] = useState<'internal' | 'customer'>('internal');
  const [tab, setTab] = useState<DetailTab>('schedule');
  const [flagDraft, setFlagDraft] = useState<CLFlag>(cl?.flag ?? 'none');
  const [noteDraft, setNoteDraft] = useState(cl?.flagNote ?? '');
  const [printTarget, setPrintTarget] = useState<'customer' | 'company' | null>(null);
  const [editingProfile, setEditingProfile] = useState(false);

  if (!cl) {
    return (
      <PageShell title="Staff member not found">
        <Link to="/cls" className="text-brand-pink underline">
          Back to CL directory
        </Link>
      </PageShell>
    );
  }

  const role = staffTypeLabels[cl.staffType];
  const history = assignments.filter((a) => a.clId === cl.id).sort((a, b) => b.date.localeCompare(a.date));
  const tier = tierForCL(cl.completedAssignments);
  const metrics = computeCLMetrics(cl, assignments.filter((a) => a.clId === cl.id));
  const monthlyFinancials = monthlyFinancialsForCL(cl, assignments.filter((a) => a.clId === cl.id));

  const scheduleRows = history.filter((a) => a.date >= TODAY_STR && a.status !== 'cancelled');
  const activeRows = history.filter((a) => a.date === TODAY_STR && (a.status === 'confirmed' || a.status === 'pending'));
  const completedRows = history.filter((a) => a.status === 'completed');

  const tabRows = tab === 'schedule' ? scheduleRows : tab === 'active' ? activeRows : tab === 'completed' ? completedRows : [];

  function saveFlag() {
    if (!cl) return;
    updateFlag(cl.id, flagDraft, noteDraft);
    logAction('Front Desk', `Updated ${role.one === 'CL' ? 'CL' : 'spa staff'} flag`, `${cl.name} → ${flagDraft === 'none' ? 'no issues' : flagDraft}`);
  }

  function handleStatusChange(status: CLStatus) {
    if (!cl) return;
    updateStatus(cl.id, status);
    logAction('Front Desk', `Updated ${role.one === 'CL' ? 'CL' : 'spa staff'} status`, `${cl.name} → ${status.replace('-', ' ')}`);
  }

  function markInactive() {
    handleStatusChange('off-duty');
  }

  function printAs(mode: 'customer' | 'company') {
    if (!cl) return;
    // Force the Internal tab synchronously first: the buttons are reachable from either tab,
    // but the hidden printable card below only mounts under view === 'internal', so without this
    // a click while on the Customer tab would print that tab's own (differently-scoped) card instead.
    flushSync(() => {
      setView('internal');
      setPrintTarget(mode);
    });
    window.print();
    logAction('Front Desk', mode === 'company' ? 'Generated company report' : 'Generated customer report', cl.name);
    setPrintTarget(null);
  }

  return (
    <PageShell title={cl.name} subtitle={cl.location}>
      <button onClick={() => navigate(role.path)} className="mb-4 flex items-center gap-2 text-sm text-brand-muted hover:text-brand-ink">
        <ArrowLeft size={15} /> Back to {role.directory}
      </button>

      <Card className="p-6">
        <div className="flex flex-wrap items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <Avatar name={cl.name} color={cl.avatarColor} size={72} />
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-lg font-semibold text-brand-ink">{cl.name}</p>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${tierStyles[tier]}`}>{tier}</span>
                {cl.flag === 'complained' && <Badge status="complained">Complaint on file</Badge>}
                {cl.flag === 'banned' && <Badge status="banned">Banned</Badge>}
              </div>
              <p className="text-sm text-brand-muted">{role.one} · {cl.location}</p>
              <div className="mt-2 flex items-center gap-3 text-sm">
                <span className="flex items-center gap-1 text-brand-ink">
                  <Star size={14} className="fill-brand-amber text-brand-amber" /> {cl.rating}
                </span>
                <select
                  value={cl.status}
                  onChange={(e) => handleStatusChange(e.target.value as CLStatus)}
                  aria-label="Status"
                  className="rounded-full bg-brand-cream px-3 py-1 text-sm text-brand-ink focus:outline-none focus:ring-2 focus:ring-brand-pink"
                >
                  {statusOptions.map((s) => (
                    <option key={s} value={s}>
                      {s.replace('-', ' ')}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <a
              href={`https://wa.me/${cl.phone.replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noreferrer"
              className={`${pillBase} bg-brand-pink text-white hover:bg-brand-pink-dark`}
            >
              <MessageCircle size={14} /> WhatsApp
            </a>
            <button onClick={() => setEditingProfile(true)} className={pillSecondary}>
              <Pencil size={14} /> Edit profile
            </button>
            <button onClick={() => printAs('company')} className={pillSecondary}>
              <FileText size={14} /> Company report
            </button>
            <button onClick={() => printAs('customer')} className={pillSecondary}>
              <FileText size={14} /> Customer report
            </button>
            <button onClick={markInactive} className={`${pillBase} bg-red-50 text-red-600 hover:bg-red-100`}>
              <UserX size={14} /> Mark inactive
            </button>
          </div>
        </div>

        {printTarget && view === 'internal' && (
          <div id="printable-cl" className="fixed left-[-9999px] top-0">
            <PrintableCLCard cl={cl} mode={printTarget} />
          </div>
        )}

        <div className="mt-8 grid grid-cols-2 gap-x-6 gap-y-6 sm:grid-cols-3 xl:grid-cols-6">
          <BigStat label="Sessions" value={cl.completedAssignments.toLocaleString()} />
          <BigStat label="Verified hours" value={metrics.verifiedHours.toLocaleString()} />
          <BigStat label="Lifetime earnings" value={metrics.lifetimeEarnings.toLocaleString()} prefix="RM" />
          <BigStat label="Points" value={metrics.leaderboardPoints.toLocaleString()} />
          <BigStat label="Good reviews" value={metrics.goodReviews} />
          <BigStat label="Poor reviews" value={metrics.poorReviews} tone={metrics.poorReviews > 0 ? 'text-red-600' : undefined} />
        </div>
        <p className="mt-5 text-sm text-brand-muted">
          {scheduleRows.length} {scheduleRows.length === 1 ? 'session' : 'sessions'} planned
          {metrics.currentJobId ? ` · current session ${metrics.currentJobId}` : ''}
        </p>
      </Card>

      <div className="mt-8 flex w-fit items-center gap-1 rounded-full bg-white p-1 text-sm">
        <button
          onClick={() => setView('internal')}
          className={`rounded-full px-4 py-1.5 font-medium transition-colors ${view === 'internal' ? 'bg-brand-pink text-white' : 'text-brand-ink hover:bg-brand-cream'}`}
        >
          Internal (company use)
        </button>
        <button
          onClick={() => setView('customer')}
          className={`rounded-full px-4 py-1.5 font-medium transition-colors ${view === 'customer' ? 'bg-brand-pink text-white' : 'text-brand-ink hover:bg-brand-cream'}`}
        >
          Customer profile
        </button>
      </div>

      {view === 'internal' ? (
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Card className="!p-0 overflow-hidden">
              <div className="flex flex-wrap gap-1 px-4 pt-4">
                {(
                  [
                    { id: 'schedule', label: 'Current schedule' },
                    { id: 'active', label: 'Active' },
                    { id: 'completed', label: 'Completed' },
                    { id: 'monthly', label: 'Monthly' },
                  ] as { id: DetailTab; label: string }[]
                ).map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTab(t.id)}
                    className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink ${
                      tab === t.id ? 'bg-brand-pink-light text-brand-pink' : 'text-brand-ink hover:bg-brand-cream'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
              <div className="p-5">
                {tab === 'monthly' ? (
                  <div>
                    <p className="mb-4 text-sm text-brand-muted">
                      Approved sessions are paid at RM {HOURS_PER_SESSION * HOURLY_RATE} a session ({HOURS_PER_SESSION}h at RM {HOURLY_RATE}/hr). Disapproved sessions were completed but
                      rejected at approval review, so no pay was released.
                    </p>
                    <div className="overflow-x-auto rounded-xl">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-brand-cream text-left text-sm text-brand-muted">
                            <th className="px-3 py-2 font-medium">Month</th>
                            <th className="px-3 py-2 font-medium">Approved</th>
                            <th className="px-3 py-2 font-medium">Disapproved</th>
                            <th className="px-3 py-2 font-medium">Earned</th>
                            <th className="px-3 py-2 font-medium">Lost</th>
                          </tr>
                        </thead>
                        <tbody>
                          {monthlyFinancials.map((m) => (
                            <tr key={m.month} className={`border-b border-black/5 last:border-b-0 ${m.isCurrent ? 'bg-brand-pink-light/40' : ''}`}>{/* taste-skill-ignore: table row */}
                              <td className="px-3 py-2 font-medium text-brand-ink">
                                {m.month}
                                {m.isCurrent && <span className="ml-2 rounded-full bg-brand-pink px-2 py-0.5 text-xs font-medium text-white">Current</span>}
                              </td>
                              <td className="px-3 py-2 text-brand-lavender">{m.approvedSessions}</td>
                              <td className="px-3 py-2 text-red-600">{m.disapprovedSessions}</td>
                              <td className="px-3 py-2 font-medium text-brand-ink">RM {m.earned.toLocaleString()}</td>
                              <td className="px-3 py-2 text-red-500">RM {m.lost.toLocaleString()}</td>
                            </tr>
                          ))}
                          <tr className="bg-brand-cream font-semibold text-brand-ink">
                            <td className="px-3 py-2">6-month total</td>
                            <td className="px-3 py-2 text-brand-lavender">{monthlyFinancials.reduce((s, m) => s + m.approvedSessions, 0)}</td>
                            <td className="px-3 py-2 text-red-600">{monthlyFinancials.reduce((s, m) => s + m.disapprovedSessions, 0)}</td>
                            <td className="px-3 py-2">RM {monthlyFinancials.reduce((s, m) => s + m.earned, 0).toLocaleString()}</td>
                            <td className="px-3 py-2 text-red-500">RM {monthlyFinancials.reduce((s, m) => s + m.lost, 0).toLocaleString()}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {tabRows.length === 0 && <p className="text-sm text-brand-muted">No sessions here yet.</p>}
                    {tabRows.map((a) => {
                      const pkg = packageById(a.packageId);
                      const client = clientById(a.clientId);
                      return (
                        <div key={a.id} className="flex items-center justify-between gap-3 rounded-xl bg-brand-cream px-4 py-3 text-sm">
                          <div>
                            <p className="font-medium text-brand-ink">{client?.name}</p>
                            <p className="text-sm text-brand-muted">
                              {pkg?.shortName} · {formatDateLabel(a.date)} · {formatTime12(a.startTime)}
                            </p>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Badge status={a.status}>{a.status}</Badge>
                            {a.status === 'completed' && (
                              <Badge status={a.paymentStatus === 'released' ? 'completed' : 'pending'}>
                                {a.paymentStatus === 'released' ? 'Paid' : a.paymentStatus === 'in-review' ? 'In review' : 'Payment pending'}
                              </Badge>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </Card>

            <Card>
              <SectionTitle>Contact & identity</SectionTitle>
              <div className="grid grid-cols-1 gap-x-6 gap-y-4 text-sm sm:grid-cols-2">
                <InfoRow icon={<Phone size={14} />} label="Phone" value={cl.phone} />
                <InfoRow icon={<Mail size={14} />} label="Email" value={cl.email} />
                <InfoRow icon={<MapPin size={14} />} label="Address" value={cl.address} />
                <InfoRow icon={<Briefcase size={14} />} label="IC number" value={cl.icNumber} />
                <InfoRow icon={<Languages size={14} />} label="Languages" value={cl.languages.join(', ')} />
                <InfoRow icon={<Clock size={14} />} label="Shift availability" value={shiftLabels[cl.shiftAvailability]} />
                <InfoRow icon={<Globe size={14} />} label="Nationality" value={cl.nationality} />
                <PassportRow cl={cl} />
                <ExpiryInfoRow icon={<BadgeCheck size={14} />} label="Work permit expiry" date={cl.workPermitExpiry} />
                <ExpiryInfoRow icon={<BadgeCheck size={14} />} label="Passport expiry" date={cl.passportExpiry} />
              </div>

              <div className="mt-8">
                <SectionTitle>Sample treatment photo</SectionTitle>
                <p className="-mt-2 mb-3 text-sm text-brand-muted">Company use only. Verifies this staff member's technique for onboarding records.</p>
                <TreatmentPhotoUpload cl={cl} />
              </div>

              <div className="mt-8">
                <SectionTitle>Bio & specialties</SectionTitle>
                <p className="text-sm text-brand-ink">{cl.bio}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {cl.specialties.map((s) => (
                    <SpecialtyChip key={s} label={s} />
                  ))}
                </div>
              </div>

              <div className="mt-8">
                <SectionTitle>Certifications & compliance</SectionTitle>
                <CertificationList cl={cl} />
              </div>
            </Card>

            <Card>
              <SectionTitle>Recent reviews</SectionTitle>
              {cl.reviews.length === 0 && <p className="text-sm text-brand-muted">No individual reviews recorded yet. The rating above reflects earlier history.</p>}
              <div className="space-y-3">
                {cl.reviews.slice(0, 5).map((r) => (
                  <div key={r.id} className="rounded-xl bg-brand-cream p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-brand-ink">{r.clientName}</p>
                      <span className="flex items-center gap-1 text-sm text-brand-ink">
                        <Star size={13} className="fill-brand-amber text-brand-amber" /> {r.rating}
                      </span>
                    </div>
                    {r.text && <p className="mt-1 text-sm text-brand-ink">{r.text}</p>}
                    <p className="mt-2 text-xs text-brand-muted">{formatDateLabel(r.date)}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="h-fit">
              <SectionTitle>Profile flag</SectionTitle>
              <p className="-mt-2 mb-4 text-sm text-brand-muted">Tag this {role.one === 'CL' ? 'CL' : 'staff member'} if a customer complaint was filed, or suspend them from new bookings.</p>

              <div className="mb-3 flex items-center gap-2">
                {cl.flag === 'none' && <ShieldCheck size={16} className="text-brand-lavender" />}
                {cl.flag === 'complained' && <ShieldAlert size={16} className="text-brand-amber" />}
                {cl.flag === 'banned' && <ShieldX size={16} className="text-red-500" />}
                <Badge status={cl.flag}>{cl.flag === 'none' ? 'No issues' : cl.flag}</Badge>
              </div>

              <div className="space-y-2">
                {flagOptions.map((opt) => (
                  <label key={opt.value} className="flex items-center gap-2 text-sm text-brand-ink">
                    <input type="radio" name="flag" checked={flagDraft === opt.value} onChange={() => setFlagDraft(opt.value)} className="accent-brand-pink" />
                    {opt.label}
                  </label>
                ))}
              </div>

              {flagDraft !== 'none' && (
                <textarea
                  value={noteDraft}
                  onChange={(e) => setNoteDraft(e.target.value)}
                  placeholder="Add a note about this flag…"
                  rows={3}
                  className="mt-3 w-full rounded-lg bg-brand-cream p-3 text-sm text-brand-ink focus:outline-none focus:ring-2 focus:ring-brand-pink"
                />
              )}

              <button onClick={saveFlag} className="mt-4 w-full rounded-full bg-brand-pink py-2 text-sm font-medium text-white hover:bg-brand-pink-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink focus-visible:ring-offset-2">
                Save flag
              </button>

              {cl.flag !== 'none' && cl.flagNote && (
                <p className="mt-4 rounded-xl bg-brand-cream p-3 text-sm text-brand-ink">Current note: {cl.flagNote}</p>
              )}

              {cl.flagHistory.length > 0 && (
                <div className="mt-6">
                  <p className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-brand-ink">
                    <History size={14} /> Flag history
                  </p>
                  <div className="space-y-2">
                    {cl.flagHistory.map((h, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm">
                        <Badge status={h.flag}>{h.flag === 'none' ? 'Cleared' : h.flag}</Badge>
                        <div className="min-w-0 flex-1">
                          <p className="text-brand-muted">{formatDateLabel(h.date)}{h.note ? `: ${h.note}` : ''}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>

            <Card className="h-fit">
              <SectionTitle>Leave & availability</SectionTitle>
              <LeaveList cl={cl} />
            </Card>

            <Card className="h-fit">
              <SectionTitle>Payroll info</SectionTitle>
              <div className="space-y-4 text-sm">
                <InfoRow icon={<Landmark size={14} />} label="Bank" value={cl.bankName || 'Not on file'} />
                <InfoRow icon={<Wallet size={14} />} label="Account" value={cl.bankAccountMasked || 'Not on file'} />
                <InfoRow
                  icon={<Wallet size={14} />}
                  label="Payment method"
                  value={cl.paymentMethod ? paymentMethodLabels[cl.paymentMethod] : 'Not on file'}
                />
              </div>
              <p className="mt-4 text-sm text-brand-muted">Edit via "Edit profile" above.</p>
            </Card>
          </div>
        </div>
      ) : (
        <CustomerProfileView cl={cl} />
      )}

      {editingProfile && <EditCLModal cl={cl} onClose={() => setEditingProfile(false)} />}

      <div className="h-6" />
    </PageShell>
  );
}

function BigStat({ label, value, prefix, tone }: { label: string; value: ReactNode; prefix?: string; tone?: string }) {
  return (
    <div className="min-w-0">
      <p className="text-sm text-brand-muted">{label}</p>
      <p className={`mt-1 truncate text-4xl font-semibold tracking-tight ${tone ?? 'text-brand-ink'}`}>
        {prefix && <span className="mr-1 text-lg font-medium tracking-normal">{prefix}</span>}
        {value}
      </p>
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div>
      <p className="mb-1 flex items-center gap-1.5 text-sm text-brand-muted">
        {icon}
        {label}
      </p>
      <p className="text-brand-ink">{value}</p>
    </div>
  );
}

function PassportRow({ cl }: { cl: import('../types').Staff }) {
  const { updatePassport } = useCLStore();
  const { logAction } = useActivityLog();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(cl.passportNumber ?? '');

  if (editing) {
    return (
      <div>
        <p className="mb-1 flex items-center gap-1.5 text-sm text-brand-muted">
          <Briefcase size={14} /> Passport number
        </p>
        <div className="flex gap-1.5">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Passport number"
            className="w-full rounded-lg bg-brand-cream px-3 py-1.5 text-sm text-brand-ink focus:outline-none focus:ring-2 focus:ring-brand-pink"
          />
          <button
            onClick={() => {
              updatePassport(cl.id, draft);
              logAction('Front Desk', 'Updated staff passport number', cl.name);
              setEditing(false);
            }}
            className="rounded-full bg-brand-pink px-4 text-sm font-medium text-white hover:bg-brand-pink-dark"
          >
            Save
          </button>
        </div>
      </div>
    );
  }

  return (
    <button onClick={() => setEditing(true)} className="text-left transition-colors hover:text-brand-pink">
      <p className="mb-1 flex items-center gap-1.5 text-sm text-brand-muted">
        <Briefcase size={14} /> Passport number
      </p>
      <p className="text-brand-ink">{cl.passportNumber || 'Not on file. Click to add'}</p>
    </button>
  );
}

function TreatmentPhotoUpload({ cl }: { cl: import('../types').Staff }) {
  const { updateTreatmentPhoto } = useCLStore();
  const { logAction } = useActivityLog();

  function handleUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      updateTreatmentPhoto(cl.id, reader.result as string);
      logAction('Front Desk', 'Uploaded staff treatment photo', cl.name);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  }

  return (
    <div className="flex items-center gap-4">
      <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-brand-cream">
        {cl.treatmentPhotoUrl ? (
          <img src={cl.treatmentPhotoUrl} alt="Treatment sample" className="h-full w-full object-cover" />
        ) : (
          <Camera size={24} className="text-brand-muted" />
        )}
      </div>
      <div>
        <label className="cursor-pointer rounded-full bg-brand-pink-light px-4 py-2 text-sm font-medium text-brand-pink hover:bg-brand-pink hover:text-white">
          {cl.treatmentPhotoUrl ? 'Replace photo' : 'Upload photo'}
          <input type="file" accept="image/*" onChange={handleUpload} className="hidden" />
        </label>
      </div>
    </div>
  );
}

function CustomerProfileView({ cl }: { cl: Staff }) {
  return (
    <div className="mt-6">
      <div className="mb-4 flex justify-end">
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 rounded-full bg-brand-pink px-4 py-2 text-sm font-medium text-white hover:bg-brand-pink-dark"
        >
          <Printer size={16} /> Generate customer PDF
        </button>
      </div>

      <div id="printable-cl" className="mx-auto max-w-xl">
        <PrintableCLCard cl={cl} mode="customer" />
      </div>
      <p className="mt-3 text-center text-sm text-brand-muted">
        This view hides phone, IC, address and internal flag notes, so it is safe to share with customers.
      </p>
    </div>
  );
}

/** Shared print/PDF card, used by the Customer tab's "Generate customer PDF" and, in `mode="company"`, the Internal tab's report buttons. */
function PrintableCLCard({ cl, mode }: { cl: Staff; mode: 'customer' | 'company' }) {
  const tier = tierForCL(cl.completedAssignments);
  return (
    <Card className="p-6 text-center">
      <div className="mx-auto mb-3 flex justify-center">
        <Avatar name={cl.name} color={cl.avatarColor} size={88} />
      </div>
      <h2 className="text-lg font-semibold text-brand-ink">{cl.name}</h2>
      <p className="text-sm text-brand-muted">{staffTypeLabels[cl.staffType].one} at Honey Spa Bangi</p>
      <span className={`mt-2 inline-block rounded-full px-2.5 py-1 text-xs font-medium ${tierStyles[tier]}`}>{tier} tier</span>
      <div className="mt-2 flex items-center justify-center gap-1">
        <Star size={16} className="fill-brand-amber text-brand-amber" />
        <span className="font-medium text-brand-ink">{cl.rating}</span>
        <span className="text-sm text-brand-muted">({cl.reviewCount} reviews)</span>
      </div>

      <div className="mx-auto mt-5 grid max-w-sm grid-cols-2 gap-3 text-sm">
        <div className="rounded-xl bg-brand-cream p-4">
          <p className="text-4xl font-semibold tracking-tight text-brand-ink">{cl.yearsExperience}</p>
          <p className="text-sm text-brand-muted">Years experience</p>
        </div>
        <div className="rounded-xl bg-brand-cream p-4">
          <p className="text-4xl font-semibold tracking-tight text-brand-ink">{cl.completedAssignments}</p>
          <p className="text-sm text-brand-muted">Sessions completed</p>
        </div>
      </div>

      <p className="mx-auto mt-4 max-w-sm text-sm text-brand-ink">{cl.bio}</p>

      <div className="mt-4 flex flex-wrap justify-center gap-1.5">
        {cl.specialties.map((s) => (
          <SpecialtyChip key={s} label={s} />
        ))}
      </div>

      <div className="mt-3 flex flex-wrap justify-center gap-1.5">
        {cl.languages.map((l) => (
          <span key={l} className="rounded-full bg-brand-cream px-2.5 py-1 text-xs text-brand-ink">
            {l}
          </span>
        ))}
      </div>

      {mode === 'company' && (
        <div className="mt-8 rounded-xl bg-brand-cream p-5 text-left">
          <p className="mb-3 text-sm font-semibold text-brand-ink">Internal only</p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
            <InfoRow icon={<Phone size={13} />} label="Phone" value={cl.phone} />
            <InfoRow icon={<Briefcase size={13} />} label="IC number" value={cl.icNumber} />
            <InfoRow icon={<MapPin size={13} />} label="Address" value={cl.address} />
            <InfoRow icon={<ShieldAlert size={13} />} label="Flag status" value={cl.flag === 'none' ? 'No issues' : cl.flag} />
          </div>
          {cl.certifications.length > 0 && (
            <div className="mt-5">
              <p className="mb-1 text-sm font-semibold text-brand-ink">Certifications</p>
              <ul className="space-y-0.5 text-sm text-brand-ink">
                {cl.certifications.map((c) => (
                  <li key={c.id}>
                    {c.name}, {c.issuer} (expires {formatDateLabel(c.expiryDate)})
                  </li>
                ))}
              </ul>
            </div>
          )}
          {cl.flagHistory.length > 0 && (
            <div className="mt-5">
              <p className="mb-1 text-sm font-semibold text-brand-ink">Flag history</p>
              <ul className="space-y-0.5 text-sm text-brand-ink">
                {cl.flagHistory.map((h, i) => (
                  <li key={i}>
                    {formatDateLabel(h.date)}: {h.flag === 'none' ? 'Cleared' : h.flag}
                    {h.note ? ` · ${h.note}` : ''}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <p className="mt-6 text-sm text-brand-muted">Honey Spa Bangi · Relax | Rejuvenate | Rejoice</p>
    </Card>
  );
}

function ExpiryInfoRow({ icon, label, date }: { icon: ReactNode; label: string; date?: string }) {
  if (!date) return <InfoRow icon={icon} label={label} value="Not applicable" />;
  const urgency = expiryUrgency(date);
  return (
    <div>
      <p className="mb-1 flex items-center gap-1.5 text-sm text-brand-muted">
        {icon}
        {label}
      </p>
      <p className="flex items-center gap-1.5 text-brand-ink">
        {formatDateLabel(date)}
        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${expiryUrgencyStyles[urgency]}`}>{expiryUrgencyLabels[urgency]}</span>
      </p>
    </div>
  );
}

function CertificationList({ cl }: { cl: Staff }) {
  const { addCertification, removeCertification } = useCLStore();
  const { logAction } = useActivityLog();
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState('');
  const [issuer, setIssuer] = useState('');
  const [expiryDate, setExpiryDate] = useState('');

  function submit() {
    if (!name.trim() || !issuer.trim() || !expiryDate) return;
    addCertification(cl.id, { name: name.trim(), issuer: issuer.trim(), expiryDate });
    logAction('Front Desk', 'Added staff certification', `${cl.name} · ${name.trim()}`);
    setName('');
    setIssuer('');
    setExpiryDate('');
    setAdding(false);
  }

  return (
    <div>
      {cl.certifications.length === 0 && <p className="mb-3 text-sm text-brand-muted">No certifications on file yet.</p>}
      <div className="space-y-2">
        {cl.certifications.map((c) => {
          const urgency = expiryUrgency(c.expiryDate);
          return (
            <div key={c.id} className="flex items-center justify-between gap-3 rounded-xl bg-brand-cream px-4 py-3 text-sm">
              <div className="min-w-0">
                <p className="truncate font-medium text-brand-ink">{c.name}</p>
                <p className="truncate text-sm text-brand-muted">{c.issuer} · expires {formatDateLabel(c.expiryDate)}</p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${expiryUrgencyStyles[urgency]}`}>{expiryUrgencyLabels[urgency]}</span>
                <button
                  onClick={() => {
                    removeCertification(cl.id, c.id);
                    logAction('Front Desk', 'Removed staff certification', `${cl.name} · ${c.name}`);
                  }}
                  aria-label={`Remove ${c.name}`}
                  className="text-brand-muted hover:text-red-600"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {adding ? (
        <div className="mt-3 space-y-2 rounded-xl bg-brand-cream p-4">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Certification name"
            className={subInputCls}
          />
          <input
            value={issuer}
            onChange={(e) => setIssuer(e.target.value)}
            placeholder="Issuer"
            className={subInputCls}
          />
          <input
            type="date"
            value={expiryDate}
            onChange={(e) => setExpiryDate(e.target.value)}
            className={subInputCls}
          />
          <div className="flex justify-end gap-2">
            <button onClick={() => setAdding(false)} className="rounded-full bg-white px-4 py-1.5 text-sm text-brand-ink hover:bg-brand-pink-light">
              Cancel
            </button>
            <button onClick={submit} className="rounded-full bg-brand-pink px-4 py-1.5 text-sm font-medium text-white hover:bg-brand-pink-dark">
              Add
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="mt-4 flex items-center gap-1.5 text-sm font-medium text-brand-pink hover:underline"
        >
          <Plus size={14} /> Add certification
        </button>
      )}
    </div>
  );
}

function LeaveList({ cl }: { cl: Staff }) {
  const { addLeavePeriod, removeLeavePeriod } = useCLStore();
  const { logAction } = useActivityLog();
  const [adding, setAdding] = useState(false);
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [reason, setReason] = useState('');

  function submit() {
    if (!start || !end) return;
    addLeavePeriod(cl.id, { start, end, reason: reason.trim() || undefined });
    logAction('Front Desk', 'Added staff leave period', `${cl.name} · ${start} to ${end}`);
    setStart('');
    setEnd('');
    setReason('');
    setAdding(false);
  }

  const isCurrentlyOnLeave = (p: { start: string; end: string }) => TODAY_STR >= p.start && TODAY_STR <= p.end;

  return (
    <div>
      {cl.leavePeriods.length === 0 && <p className="mb-3 text-sm text-brand-muted">No leave periods on file.</p>}
      <div className="space-y-2">
        {cl.leavePeriods.map((p, i) => (
          <div key={i} className="flex items-center justify-between gap-3 rounded-xl bg-brand-cream px-4 py-3 text-sm">
            <div className="flex min-w-0 items-center gap-2">
              <CalendarOff size={14} className="shrink-0 text-brand-muted" />
              <div className="min-w-0">
                <p className="truncate text-brand-ink">
                  {formatDateLabel(p.start)} – {formatDateLabel(p.end)}
                </p>
                {p.reason && <p className="truncate text-sm text-brand-muted">{p.reason}</p>}
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {isCurrentlyOnLeave(p) && <Badge status="on-leave">Active</Badge>}
              <button
                onClick={() => {
                  removeLeavePeriod(cl.id, i);
                  logAction('Front Desk', 'Removed staff leave period', `${cl.name} · ${p.start} to ${p.end}`);
                }}
                aria-label="Remove leave period"
                className="text-brand-muted hover:text-red-600"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {adding ? (
        <div className="mt-3 space-y-2 rounded-xl bg-brand-cream p-4">
          <div className="grid grid-cols-2 gap-2">
            <input type="date" value={start} onChange={(e) => setStart(e.target.value)} className={subInputCls} />
            <input type="date" value={end} onChange={(e) => setEnd(e.target.value)} className={subInputCls} />
          </div>
          <input
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Reason (optional)"
            className={subInputCls}
          />
          <div className="flex justify-end gap-2">
            <button onClick={() => setAdding(false)} className="rounded-full bg-white px-4 py-1.5 text-sm text-brand-ink hover:bg-brand-pink-light">
              Cancel
            </button>
            <button onClick={submit} className="rounded-full bg-brand-pink px-4 py-1.5 text-sm font-medium text-white hover:bg-brand-pink-dark">
              Add leave
            </button>
          </div>
        </div>
      ) : (
        <button onClick={() => setAdding(true)} className="mt-4 flex items-center gap-1.5 text-sm font-medium text-brand-pink hover:underline">
          <Plus size={14} /> Add leave period
        </button>
      )}
    </div>
  );
}

function EditCLModal({ cl, onClose }: { cl: Staff; onClose: () => void }) {
  const { updateDetails } = useCLStore();
  const { logAction } = useActivityLog();
  const [phone, setPhone] = useState(cl.phone);
  const [email, setEmail] = useState(cl.email);
  const [address, setAddress] = useState(cl.address);
  const [icNumber, setIcNumber] = useState(cl.icNumber);
  const [yearsExperience, setYearsExperience] = useState(String(cl.yearsExperience));
  const [languages, setLanguages] = useState(cl.languages.join(', '));
  const [specialties, setSpecialties] = useState(cl.specialties.join(', '));
  const [bio, setBio] = useState(cl.bio);
  const [nationality, setNationality] = useState(cl.nationality);
  const [workPermitExpiry, setWorkPermitExpiry] = useState(cl.workPermitExpiry ?? '');
  const [passportExpiry, setPassportExpiry] = useState(cl.passportExpiry ?? '');
  const [bankName, setBankName] = useState(cl.bankName ?? '');
  const [bankAccountMasked, setBankAccountMasked] = useState(cl.bankAccountMasked ?? '');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | ''>(cl.paymentMethod ?? '');

  function save() {
    updateDetails(cl.id, {
      phone: phone.trim(),
      email: email.trim(),
      address: address.trim(),
      icNumber: icNumber.trim(),
      yearsExperience: Number(yearsExperience) || 0,
      languages: languages.split(',').map((s) => s.trim()).filter(Boolean),
      specialties: specialties.split(',').map((s) => s.trim()).filter(Boolean),
      bio: bio.trim(),
      nationality: nationality.trim() || 'Malaysian',
      workPermitExpiry: workPermitExpiry || undefined,
      passportExpiry: passportExpiry || undefined,
      bankName: bankName.trim() || undefined,
      bankAccountMasked: bankAccountMasked.trim() || undefined,
      paymentMethod: paymentMethod || undefined,
    });
    logAction('Front Desk', 'Edited staff profile', cl.name);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-xl">{/* taste-skill-ignore: overlay */}
        <div className="flex items-center justify-between px-6 pt-6">
          <h2 className="text-lg font-semibold text-brand-ink">Edit profile · {cl.name}</h2>
          <button onClick={onClose} aria-label="Close" className="rounded-full p-1 text-brand-muted hover:bg-brand-cream hover:text-brand-ink">
            <X size={18} />
          </button>
        </div>
        <div className="space-y-4 px-6 pt-5">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Phone"><input value={phone} onChange={(e) => setPhone(e.target.value)} className={inputCls} /></Field>
            <Field label="Email"><input value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} /></Field>
          </div>
          <Field label="Address"><input value={address} onChange={(e) => setAddress(e.target.value)} className={inputCls} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="IC number"><input value={icNumber} onChange={(e) => setIcNumber(e.target.value)} className={inputCls} /></Field>
            <Field label="Years experience"><input type="number" min={0} value={yearsExperience} onChange={(e) => setYearsExperience(e.target.value)} className={inputCls} /></Field>
          </div>
          <Field label="Languages (comma-separated)"><input value={languages} onChange={(e) => setLanguages(e.target.value)} className={inputCls} /></Field>
          <Field label="Specialties (comma-separated)"><input value={specialties} onChange={(e) => setSpecialties(e.target.value)} className={inputCls} /></Field>
          <Field label="Bio"><textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={2} className={inputCls} /></Field>

          <div className="pt-4">
            <p className="mb-3 text-sm font-semibold text-brand-ink">Compliance</p>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Nationality"><input value={nationality} onChange={(e) => setNationality(e.target.value)} className={inputCls} /></Field>
              <Field label="Work permit expiry"><input type="date" value={workPermitExpiry} onChange={(e) => setWorkPermitExpiry(e.target.value)} className={inputCls} /></Field>
              <Field label="Passport expiry"><input type="date" value={passportExpiry} onChange={(e) => setPassportExpiry(e.target.value)} className={inputCls} /></Field>
            </div>
          </div>

          <div className="pt-4">
            <p className="mb-3 text-sm font-semibold text-brand-ink">Payroll info</p>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Bank name"><input value={bankName} onChange={(e) => setBankName(e.target.value)} className={inputCls} /></Field>
              <Field label="Account (masked)"><input value={bankAccountMasked} onChange={(e) => setBankAccountMasked(e.target.value)} placeholder="•••• 1234" className={inputCls} /></Field>
              <Field label="Payment method">
                <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod | '')} className={inputCls}>
                  <option value="">Not on file</option>
                  <option value="bank-transfer">Bank transfer</option>
                  <option value="cash">Cash</option>
                  <option value="e-wallet">E-wallet</option>
                </select>
              </Field>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 p-6">
          <button onClick={onClose} className="rounded-full bg-brand-cream px-4 py-2 text-sm text-brand-ink hover:bg-brand-pink-light">
            Cancel
          </button>
          <button onClick={save} className="rounded-full bg-brand-pink px-4 py-2 text-sm font-medium text-white hover:bg-brand-pink-dark">
            Save changes
          </button>
        </div>
      </div>
    </div>
  );
}

const inputCls = 'w-full rounded-lg bg-brand-cream px-3 py-2 text-sm text-brand-ink focus:outline-none focus:ring-2 focus:ring-brand-pink';
/** Inputs that sit inside a cream add-row panel, so they take a white fill instead. */
const subInputCls = 'w-full rounded-lg bg-white px-3 py-2 text-sm text-brand-ink focus:outline-none focus:ring-2 focus:ring-brand-pink';

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-sm text-brand-muted">{label}</label>
      {children}
    </div>
  );
}
