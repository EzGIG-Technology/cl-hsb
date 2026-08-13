import { useState, type ReactNode } from 'react';
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
} from 'lucide-react';
import { PageShell } from '../components/PageShell';
import { Card, Badge, Avatar, SectionTitle } from '../components/ui';
import { useCLStore } from '../store/CLStore';
import { assignments } from '../data/assignments';
import { useSettings } from '../store/SettingsContext';
import { clientById } from '../data/clients';
import { formatTime12, formatDateLabel } from '../lib/date';
import type { CLFlag, CLStatus } from '../types';

const flagOptions: { value: CLFlag; label: string }[] = [
  { value: 'none', label: 'No issues' },
  { value: 'complained', label: 'Complained' },
  { value: 'banned', label: 'Banned' },
];

const statusOptions: CLStatus[] = ['on-duty', 'available', 'on-leave', 'off-duty'];

export default function CLProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { clById, updateFlag, updateStatus } = useCLStore();
  const { packageById } = useSettings();
  const cl = id ? clById(id) : undefined;
  const [view, setView] = useState<'internal' | 'customer'>('internal');
  const [flagDraft, setFlagDraft] = useState<CLFlag>(cl?.flag ?? 'none');
  const [noteDraft, setNoteDraft] = useState(cl?.flagNote ?? '');

  if (!cl) {
    return (
      <PageShell title="CL not found">
        <div className="pt-8">
          <Link to="/cls" className="text-brand-maroon underline">
            Back to Confinement Ladies
          </Link>
        </div>
      </PageShell>
    );
  }

  const history = assignments
    .filter((a) => a.clId === cl.id)
    .sort((a, b) => b.date.localeCompare(a.date));

  function saveFlag() {
    if (!cl) return;
    updateFlag(cl.id, flagDraft, noteDraft);
  }

  return (
    <PageShell
      title={cl.name}
      subtitle={cl.location}
      sidePanel={
        <div className="flex flex-1 flex-col gap-4">
          <button onClick={() => navigate('/cls')} className="flex items-center gap-2 text-sm text-white/80 hover:text-white">
            <ArrowLeft size={16} /> Back to directory
          </button>

          <div className="flex flex-col items-center rounded-2xl bg-white/10 p-5 text-center">
            <Avatar name={cl.name} color={cl.avatarColor} size={72} />
            <p className="mt-3 font-semibold">{cl.name}</p>
            <p className="text-xs text-white/60">CL {cl.name.split(' ')[0]}</p>
            <div className="mt-2 flex items-center gap-1 text-sm">
              <Star size={14} className="fill-brand-amber text-brand-amber" />
              {cl.rating} <span className="text-white/60">({cl.reviewCount})</span>
            </div>
          </div>

          <div className="rounded-2xl bg-white/10 p-4">
            <h3 className="mb-2 text-sm font-semibold text-white/80">Roster status</h3>
            <select
              value={cl.status}
              onChange={(e) => updateStatus(cl.id, e.target.value as CLStatus)}
              className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-white [color-scheme:dark]"
            >
              {statusOptions.map((s) => (
                <option key={s} value={s} className="text-brand-ink">
                  {s.replace('-', ' ')}
                </option>
              ))}
            </select>
          </div>

          <div className="rounded-2xl bg-white/10 p-4 text-sm">
            <h3 className="mb-2 font-semibold text-white/80">Quick stats</h3>
            <div className="space-y-1.5 text-white/85">
              <p>{cl.completedAssignments} completed assignments</p>
              <p>{cl.yearsExperience} years experience</p>
              <p>Joined {formatDateLabel(cl.joinedDate)} {new Date(cl.joinedDate).getFullYear()}</p>
            </div>
          </div>
        </div>
      }
    >
      <div className="pt-4">
        <div className="flex items-center gap-2 rounded-full bg-white p-1 text-sm shadow-sm w-fit">
          <button
            onClick={() => setView('internal')}
            className={`rounded-full px-4 py-1.5 font-medium transition-colors ${view === 'internal' ? 'bg-brand-maroon text-white' : 'text-brand-muted'}`}
          >
            Internal (company use)
          </button>
          <button
            onClick={() => setView('customer')}
            className={`rounded-full px-4 py-1.5 font-medium transition-colors ${view === 'customer' ? 'bg-brand-maroon text-white' : 'text-brand-muted'}`}
          >
            Customer profile
          </button>
        </div>

        {view === 'internal' ? (
          <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <SectionTitle>Contact & identity</SectionTitle>
              <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                <InfoRow icon={<Phone size={14} />} label="Phone" value={cl.phone} />
                <InfoRow icon={<Mail size={14} />} label="Email" value={cl.email} />
                <InfoRow icon={<MapPin size={14} />} label="Address" value={cl.address} />
                <InfoRow icon={<Briefcase size={14} />} label="IC number" value={cl.icNumber} />
                <InfoRow icon={<Languages size={14} />} label="Languages" value={cl.languages.join(', ')} />
              </div>

              <div className="mt-5 border-t border-black/5 pt-4">
                <SectionTitle>Bio & specialties</SectionTitle>
                <p className="text-sm text-brand-ink">{cl.bio}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {cl.specialties.map((s) => (
                    <span key={s} className="rounded-full bg-brand-pink-light px-2.5 py-1 text-xs text-brand-maroon">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-5 border-t border-black/5 pt-4">
                <SectionTitle>Assignment history</SectionTitle>
                <div className="space-y-2">
                  {history.length === 0 && <p className="text-sm text-brand-muted">No assignment history yet.</p>}
                  {history.map((a) => {
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
                        <Badge status={a.status}>{a.status}</Badge>
                      </div>
                    );
                  })}
                </div>
              </div>
            </Card>

            <Card>
              <SectionTitle>Profile flag</SectionTitle>
              <p className="mb-3 text-xs text-brand-muted">
                Tag this CL if a client complaint was filed, or suspend them from new bookings.
              </p>

              <div className="mb-3 flex items-center gap-2">
                {cl.flag === 'none' && <ShieldCheck size={16} className="text-brand-green" />}
                {cl.flag === 'complained' && <ShieldAlert size={16} className="text-brand-amber" />}
                {cl.flag === 'banned' && <ShieldX size={16} className="text-red-500" />}
                <Badge status={cl.flag}>{cl.flag === 'none' ? 'No issues' : cl.flag}</Badge>
              </div>

              <div className="space-y-2">
                {flagOptions.map((opt) => (
                  <label key={opt.value} className="flex items-center gap-2 text-sm">
                    <input
                      type="radio"
                      name="flag"
                      checked={flagDraft === opt.value}
                      onChange={() => setFlagDraft(opt.value)}
                    />
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

              <button
                onClick={saveFlag}
                className="mt-3 w-full rounded-full bg-brand-maroon py-2 text-sm font-medium text-white hover:bg-brand-maroon-dark"
              >
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
      </div>

      <div className="h-6" />
    </PageShell>
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

function CustomerProfileView({ cl }: { cl: import('../types').ConfinementLady }) {
  return (
    <div className="mt-5">
      <div className="mb-3 flex justify-end">
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 rounded-full bg-brand-maroon px-4 py-2 text-sm font-medium text-white hover:bg-brand-maroon-dark"
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
              <span key={s} className="rounded-full bg-brand-pink-light px-2.5 py-1 text-xs text-brand-maroon">
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
