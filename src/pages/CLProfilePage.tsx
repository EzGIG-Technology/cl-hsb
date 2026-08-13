import { useState, type ReactNode, type ChangeEvent } from 'react';
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
  Award,
  ThumbsUp,
  ThumbsDown,
  Hash,
  ClipboardCheck,
} from 'lucide-react';
import { PageShell } from '../components/PageShell';
import { Card, Badge, Avatar, SectionTitle } from '../components/ui';
import { useCLStore } from '../store/CLStore';
import { assignments } from '../data/assignments';
import { useSettings } from '../store/SettingsContext';
import { useClientStore } from '../store/ClientStore';
import { useActivityLog } from '../store/ActivityLogContext';
import { computeCLMetrics, monthlyFinancialsForCL } from '../lib/clMetrics';
import { formatTime12, formatDateLabel, TODAY_STR } from '../lib/date';
import { tierForCL, type CLFlag, type CLStatus } from '../types';

const shiftLabels: Record<string, string> = {
  morning: 'Morning only',
  afternoon: 'Afternoon only',
  both: 'Morning & afternoon',
  'stay-in': 'Stay-in placements',
  flexible: 'Flexible',
};

const tierStyles: Record<string, string> = {
  Bronze: 'bg-amber-100 text-amber-800',
  Silver: 'bg-gray-200 text-gray-700',
  Gold: 'bg-brand-amber-light text-brand-amber',
  Platinum: 'bg-brand-pink-light text-brand-pink',
};

const flagOptions: { value: CLFlag; label: string }[] = [
  { value: 'none', label: 'No issues' },
  { value: 'complained', label: 'Complained' },
  { value: 'banned', label: 'Banned' },
];

const statusOptions: CLStatus[] = ['on-duty', 'available', 'on-leave', 'off-duty'];
type DetailTab = 'schedule' | 'active' | 'completed' | 'monthly';

export default function CLProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { clById, updateFlag, updateStatus } = useCLStore();
  const { packageById } = useSettings();
  const { clientById } = useClientStore();
  const { logAction } = useActivityLog();
  const cl = id ? clById(id) : undefined;
  const [view, setView] = useState<'internal' | 'customer'>('internal');
  const [tab, setTab] = useState<DetailTab>('schedule');
  const [flagDraft, setFlagDraft] = useState<CLFlag>(cl?.flag ?? 'none');
  const [noteDraft, setNoteDraft] = useState(cl?.flagNote ?? '');

  if (!cl) {
    return (
      <PageShell title="CL not found">
        <Link to="/cls" className="text-brand-pink underline">
          Back to Confinement Ladies
        </Link>
      </PageShell>
    );
  }

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
    logAction('Admin Amy', 'Updated CL flag', `${cl.name} → ${flagDraft === 'none' ? 'no issues' : flagDraft}`);
  }

  function handleStatusChange(status: CLStatus) {
    if (!cl) return;
    updateStatus(cl.id, status);
    logAction('Admin Amy', 'Updated CL status', `${cl.name} → ${status.replace('-', ' ')}`);
  }

  function markInactive() {
    handleStatusChange('off-duty');
  }

  return (
    <PageShell title={cl.name} subtitle={cl.location}>
      <button onClick={() => navigate('/cls')} className="mb-4 flex items-center gap-2 text-sm text-brand-muted hover:text-brand-ink">
        <ArrowLeft size={15} /> Back to directory
      </button>

      <Card className="mb-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Avatar name={cl.name} color={cl.avatarColor} size={64} />
            <div>
              <div className="flex items-center gap-2">
                <p className="text-lg font-semibold text-brand-ink">{cl.name}</p>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${tierStyles[tier]}`}>{tier}</span>
              </div>
              <p className="text-sm text-brand-muted">CL {cl.name.split(' ')[0]} · {cl.location}</p>
              <div className="mt-1 flex items-center gap-3 text-sm">
                <span className="flex items-center gap-1 text-brand-ink">
                  <Star size={13} className="fill-brand-amber text-brand-amber" /> {cl.rating}
                </span>
                <select
                  value={cl.status}
                  onChange={(e) => handleStatusChange(e.target.value as CLStatus)}
                  className="rounded-full border border-black/10 bg-brand-cream px-2.5 py-1 text-xs text-brand-ink"
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
              className="flex items-center gap-1.5 rounded-full bg-brand-green px-3 py-1.5 text-xs font-medium text-white hover:opacity-90"
            >
              <MessageCircle size={13} /> WhatsApp
            </a>
            <button
              onClick={() => logAction('Admin Amy', 'Generated company report', cl.name)}
              className="flex items-center gap-1.5 rounded-full border border-black/10 px-3 py-1.5 text-xs font-medium text-brand-ink hover:bg-brand-cream"
            >
              <FileText size={13} /> Company Report
            </button>
            <button
              onClick={() => logAction('Admin Amy', 'Generated customer report', cl.name)}
              className="flex items-center gap-1.5 rounded-full border border-black/10 px-3 py-1.5 text-xs font-medium text-brand-ink hover:bg-brand-cream"
            >
              <FileText size={13} /> Customer Report
            </button>
            <button
              onClick={markInactive}
              className="flex items-center gap-1.5 rounded-full border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
            >
              <UserX size={13} /> Mark Inactive
            </button>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 border-t border-black/5 pt-4 sm:grid-cols-4 lg:grid-cols-8">
          <Stat icon={<Hash size={12} />} label="Total Sessions" value={cl.completedAssignments} />
          <Stat icon={<ClipboardCheck size={12} />} label="Sessions Planned" value={scheduleRows.length} />
          <Stat icon={<Clock size={12} />} label="Verified Hours" value={metrics.verifiedHours} />
          <Stat icon={<Wallet size={12} />} label="Lifetime Earnings" value={`RM ${metrics.lifetimeEarnings.toLocaleString()}`} />
          <Stat icon={<Hash size={12} />} label="Current Job ID" value={metrics.currentJobId} />
          <Stat icon={<Award size={12} />} label="Leaderboard Pts" value={metrics.leaderboardPoints.toLocaleString()} />
          <Stat icon={<ThumbsUp size={12} />} label="Good Reviews" value={metrics.goodReviews} />
          <Stat icon={<ThumbsDown size={12} />} label="Poor Reviews" value={metrics.poorReviews} />
        </div>
      </Card>

      <div className="flex items-center gap-2 rounded-full bg-white p-1 text-sm shadow-sm w-fit">
        <button
          onClick={() => setView('internal')}
          className={`rounded-full px-4 py-1.5 font-medium transition-colors ${view === 'internal' ? 'bg-brand-pink text-white' : 'text-brand-muted'}`}
        >
          Internal (company use)
        </button>
        <button
          onClick={() => setView('customer')}
          className={`rounded-full px-4 py-1.5 font-medium transition-colors ${view === 'customer' ? 'bg-brand-pink text-white' : 'text-brand-muted'}`}
        >
          Customer profile
        </button>
      </div>

      {view === 'internal' ? (
        <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-5">
            <Card className="!p-0 overflow-hidden">
              <div className="flex flex-wrap gap-1 border-b border-black/5 p-2">
                {(
                  [
                    { id: 'schedule', label: 'Current Schedule' },
                    { id: 'active', label: 'Active Sessions' },
                    { id: 'completed', label: 'Completed Jobs' },
                    { id: 'monthly', label: 'Monthly Output' },
                  ] as { id: DetailTab; label: string }[]
                ).map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTab(t.id)}
                    className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
                      tab === t.id ? 'bg-brand-pink-light text-brand-pink-dark' : 'text-brand-muted hover:bg-brand-cream'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
              <div className="p-4">
                {tab === 'monthly' ? (
                  <div>
                    <p className="mb-3 text-xs text-brand-muted">
                      Approved sessions are paid at RM {22 * 4}/session (4h @ RM22/hr). Disapproved sessions were completed but rejected at
                      approval review — no pay released.
                    </p>
                    <div className="overflow-x-auto rounded-xl border border-black/5">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-black/5 bg-brand-cream text-left text-xs text-brand-muted">
                            <th className="px-3 py-2 font-medium">Month</th>
                            <th className="px-3 py-2 font-medium">Approved</th>
                            <th className="px-3 py-2 font-medium">Disapproved</th>
                            <th className="px-3 py-2 font-medium">Earned</th>
                            <th className="px-3 py-2 font-medium">Lost</th>
                          </tr>
                        </thead>
                        <tbody>
                          {monthlyFinancials.map((m) => (
                            <tr key={m.month} className={`border-b border-black/5 last:border-b-0 ${m.isCurrent ? 'bg-brand-pink-light/40' : ''}`}>
                              <td className="px-3 py-2 font-medium text-brand-ink">
                                {m.month}
                                {m.isCurrent && <span className="ml-1.5 rounded-full bg-brand-pink px-1.5 py-0.5 text-[9px] font-semibold text-white">Current</span>}
                              </td>
                              <td className="px-3 py-2 text-brand-green">{m.approvedSessions}</td>
                              <td className="px-3 py-2 text-red-600">{m.disapprovedSessions}</td>
                              <td className="px-3 py-2 font-medium text-brand-ink">RM {m.earned.toLocaleString()}</td>
                              <td className="px-3 py-2 text-red-500">RM {m.lost.toLocaleString()}</td>
                            </tr>
                          ))}
                          <tr className="bg-brand-cream font-semibold text-brand-ink">
                            <td className="px-3 py-2">6-month total</td>
                            <td className="px-3 py-2 text-brand-green">{monthlyFinancials.reduce((s, m) => s + m.approvedSessions, 0)}</td>
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
                    {tabRows.length === 0 && <p className="text-sm text-brand-muted">Nothing here yet.</p>}
                    {tabRows.map((a) => {
                      const pkg = packageById(a.packageId);
                      const client = clientById(a.clientId);
                      return (
                        <div key={a.id} className="flex items-center justify-between rounded-xl border border-black/5 px-3 py-2 text-sm">
                          <div>
                            <p className="font-medium text-brand-ink">{client?.name}</p>
                            <p className="text-xs text-brand-muted">
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
              <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                <InfoRow icon={<Phone size={14} />} label="Phone" value={cl.phone} />
                <InfoRow icon={<Mail size={14} />} label="Email" value={cl.email} />
                <InfoRow icon={<MapPin size={14} />} label="Address" value={cl.address} />
                <InfoRow icon={<Briefcase size={14} />} label="IC number" value={cl.icNumber} />
                <InfoRow icon={<Languages size={14} />} label="Languages" value={cl.languages.join(', ')} />
                <InfoRow icon={<Clock size={14} />} label="Shift availability" value={shiftLabels[cl.shiftAvailability]} />
                <PassportRow cl={cl} />
              </div>

              <div className="mt-5 border-t border-black/5 pt-4">
                <SectionTitle>Sample treatment photo</SectionTitle>
                <p className="mb-2 -mt-1 text-xs text-brand-muted">Company use only — verifies this CL's technique for onboarding records.</p>
                <TreatmentPhotoUpload cl={cl} />
              </div>

              <div className="mt-5 border-t border-black/5 pt-4">
                <SectionTitle>Bio & specialties</SectionTitle>
                <p className="text-sm text-brand-ink">{cl.bio}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {cl.specialties.map((s) => (
                    <span key={s} className="rounded-full bg-brand-pink-light px-2.5 py-1 text-xs text-brand-pink">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          <Card className="h-fit">
            <SectionTitle>Profile flag</SectionTitle>
            <p className="mb-3 text-xs text-brand-muted">Tag this CL if a client complaint was filed, or suspend them from new bookings.</p>

            <div className="mb-3 flex items-center gap-2">
              {cl.flag === 'none' && <ShieldCheck size={16} className="text-brand-green" />}
              {cl.flag === 'complained' && <ShieldAlert size={16} className="text-brand-amber" />}
              {cl.flag === 'banned' && <ShieldX size={16} className="text-red-500" />}
              <Badge status={cl.flag}>{cl.flag === 'none' ? 'No issues' : cl.flag}</Badge>
            </div>

            <div className="space-y-2">
              {flagOptions.map((opt) => (
                <label key={opt.value} className="flex items-center gap-2 text-sm">
                  <input type="radio" name="flag" checked={flagDraft === opt.value} onChange={() => setFlagDraft(opt.value)} />
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
                className="mt-3 w-full rounded-lg border border-black/10 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-pink"
              />
            )}

            <button onClick={saveFlag} className="mt-3 w-full rounded-full bg-brand-pink py-2 text-sm font-medium text-white hover:bg-brand-pink-dark">
              Save flag
            </button>

            {cl.flag !== 'none' && cl.flagNote && (
              <p className="mt-3 rounded-lg bg-brand-cream p-2 text-xs text-brand-muted">Current note: {cl.flagNote}</p>
            )}
          </Card>
        </div>
      ) : (
        <CustomerProfileView cl={cl} />
      )}

      <div className="h-6" />
    </PageShell>
  );
}

function Stat({ icon, label, value }: { icon: ReactNode; label: string; value: ReactNode }) {
  return (
    <div>
      <p className="flex items-center gap-1 text-[10px] text-brand-muted">
        {icon} {label}
      </p>
      <p className="mt-0.5 truncate text-sm font-semibold text-brand-ink">{value}</p>
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div>
      <p className="mb-1 flex items-center gap-1.5 text-xs text-brand-muted">
        {icon}
        {label}
      </p>
      <p className="text-brand-ink">{value}</p>
    </div>
  );
}

function PassportRow({ cl }: { cl: import('../types').ConfinementLady }) {
  const { updatePassport } = useCLStore();
  const { logAction } = useActivityLog();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(cl.passportNumber ?? '');

  if (editing) {
    return (
      <div>
        <p className="mb-1 flex items-center gap-1.5 text-xs text-brand-muted">
          <Briefcase size={14} /> Passport (company use)
        </p>
        <div className="flex gap-1.5">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Passport number"
            className="w-full rounded-md border border-black/10 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-brand-pink"
          />
          <button
            onClick={() => {
              updatePassport(cl.id, draft);
              logAction('Admin Amy', 'Updated CL passport number', cl.name);
              setEditing(false);
            }}
            className="rounded-md bg-brand-pink px-2 text-xs font-medium text-white"
          >
            Save
          </button>
        </div>
      </div>
    );
  }

  return (
    <button onClick={() => setEditing(true)} className="text-left hover:opacity-80">
      <p className="mb-1 flex items-center gap-1.5 text-xs text-brand-muted">
        <Briefcase size={14} /> Passport (company use)
      </p>
      <p className="text-brand-ink">{cl.passportNumber || 'Not on file — click to add'}</p>
    </button>
  );
}

function TreatmentPhotoUpload({ cl }: { cl: import('../types').ConfinementLady }) {
  const { updateTreatmentPhoto } = useCLStore();
  const { logAction } = useActivityLog();

  function handleUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      updateTreatmentPhoto(cl.id, reader.result as string);
      logAction('Admin Amy', 'Uploaded CL treatment photo', cl.name);
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
        <label className="cursor-pointer rounded-full bg-brand-pink px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-pink-dark">
          {cl.treatmentPhotoUrl ? 'Replace photo' : 'Upload photo'}
          <input type="file" accept="image/*" onChange={handleUpload} className="hidden" />
        </label>
      </div>
    </div>
  );
}

function CustomerProfileView({ cl }: { cl: import('../types').ConfinementLady }) {
  const tier = tierForCL(cl.completedAssignments);
  return (
    <div className="mt-5">
      <div className="mb-3 flex justify-end">
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 rounded-full bg-brand-pink px-4 py-2 text-sm font-medium text-white hover:bg-brand-pink-dark"
        >
          <Printer size={16} /> Generate customer PDF
        </button>
      </div>

      <div id="printable-cl" className="mx-auto max-w-xl">
        <Card className="text-center">
          <div className="mx-auto mb-3 flex justify-center">
            <Avatar name={cl.name} color={cl.avatarColor} size={88} />
          </div>
          <h2 className="text-xl font-semibold text-brand-ink">CL {cl.name.split(' ')[0]}</h2>
          <p className="text-sm text-brand-muted">{cl.name}</p>
          <span className={`mt-2 inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${tierStyles[tier]}`}>{tier} tier</span>
          <div className="mt-2 flex items-center justify-center gap-1">
            <Star size={16} className="fill-brand-amber text-brand-amber" />
            <span className="font-medium text-brand-ink">{cl.rating}</span>
            <span className="text-sm text-brand-muted">({cl.reviewCount} reviews)</span>
          </div>

          <div className="mx-auto mt-4 grid max-w-sm grid-cols-2 gap-3 text-sm">
            <div className="rounded-xl bg-brand-cream p-3">
              <p className="text-lg font-semibold text-brand-ink">{cl.yearsExperience}</p>
              <p className="text-xs text-brand-muted">Years experience</p>
            </div>
            <div className="rounded-xl bg-brand-cream p-3">
              <p className="text-lg font-semibold text-brand-ink">{cl.completedAssignments}</p>
              <p className="text-xs text-brand-muted">Placements completed</p>
            </div>
          </div>

          <p className="mx-auto mt-4 max-w-sm text-sm text-brand-ink">{cl.bio}</p>

          <div className="mt-4 flex flex-wrap justify-center gap-1.5">
            {cl.specialties.map((s) => (
              <span key={s} className="rounded-full bg-brand-pink-light px-2.5 py-1 text-xs text-brand-pink">
                {s}
              </span>
            ))}
          </div>

          <div className="mt-3 flex flex-wrap justify-center gap-1.5">
            {cl.languages.map((l) => (
              <span key={l} className="rounded-full border border-black/10 px-2.5 py-1 text-xs text-brand-muted">
                {l}
              </span>
            ))}
          </div>

          <p className="mt-5 text-xs italic text-brand-muted">NR Mothercare Confinement — Sentuhan Tradisional Untuk Para Ibu</p>
        </Card>
      </div>
      <p className="mt-2 text-center text-xs text-brand-muted">
        This view hides phone, IC, address, and internal flag notes — safe to share with clients.
      </p>
    </div>
  );
}
