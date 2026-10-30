import { useState, type ChangeEvent } from 'react';
import { X, MapPin, Camera, ClipboardCheck, ShieldCheck, ShieldX, FileSignature, Clock } from 'lucide-react';
import { PageShell } from '../components/PageShell';
import { Card, Avatar, Badge, formatRM } from '../components/ui';
import { useAssignmentStore } from '../store/AssignmentStore';
import { useClientStore } from '../store/ClientStore';
import { useCLStore } from '../store/CLStore';
import { useSettings } from '../store/SettingsContext';
import { useActivityLog } from '../store/ActivityLogContext';
import { useAvatarStore } from '../store/AvatarStore';
import { formatDateLabel, formatTime12 } from '../lib/date';
import type { Assignment } from '../types';

type VerificationStatus = 'Verified' | 'In Progress' | 'Missing Check-Out Selfie' | 'GPS Mismatch';

function verificationFor(a: Assignment): VerificationStatus {
  if (a.status === 'confirmed' || a.status === 'pending') return 'In Progress';
  if (a.status !== 'completed') return 'Verified';
  const hash = a.id.split('').reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
  if (hash % 11 === 0) return 'GPS Mismatch';
  if (hash % 13 === 0) return 'Missing Check-Out Selfie';
  return 'Verified';
}

function minutesFor(a: Assignment) {
  const [sh, sm] = a.startTime.split(':').map(Number);
  const [eh, em] = a.endTime.split(':').map(Number);
  return eh * 60 + em - (sh * 60 + sm);
}

const approvalNoticeStyles: Record<'Approved' | 'Rejected', string> = {
  Approved: 'bg-brand-lavender-light text-brand-lavender',
  Rejected: 'bg-red-100 text-red-600',
};

function approvalLabel(a: Assignment): 'Pending Approval' | 'Approved' | 'Rejected' {
  if (a.approvalStatus === 'approved') return 'Approved';
  if (a.approvalStatus === 'rejected') return 'Rejected';
  return 'Pending Approval';
}

/** Deterministic mock checklist built from the treatment's own steps, so the approval panel has something concrete to review. */
function checklistFor(a: Assignment, treatmentSteps: string[]) {
  const hash = a.id.split('').reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
  return treatmentSteps.map((task, i) => ({ task, done: (hash + i) % 9 !== 0 }));
}

type Filter = 'all' | VerificationStatus | 'Pending Approval';

const filterLabels: Record<Filter, string> = {
  all: 'All',
  'Pending Approval': 'Awaiting approval',
  Verified: 'Verified',
  'In Progress': 'In progress',
  'Missing Check-Out Selfie': 'Missing check-out selfie',
  'GPS Mismatch': 'GPS mismatch',
};

export default function VisitsPage() {
  const { assignments, setApproval } = useAssignmentStore();
  const { clients } = useClientStore();
  const { cls } = useCLStore();
  const { packageById } = useSettings();
  const { logAction } = useActivityLog();
  const [inspecting, setInspecting] = useState<Assignment | null>(null);
  const [filter, setFilter] = useState<Filter>('all');
  const [rejectNote, setRejectNote] = useState('');

  const pendingApprovalCount = assignments.filter((a) => a.status === 'completed' && !a.approvalStatus).length;
  const tracked = assignments.filter((a) => a.status !== 'cancelled').map(verificationFor);
  const verifiedCount = tracked.filter((s) => s === 'Verified').length;
  const inProgressCount = tracked.filter((s) => s === 'In Progress').length;
  const flaggedCount = tracked.filter((s) => s === 'Missing Check-Out Selfie' || s === 'GPS Mismatch').length;

  const rows = [...assignments]
    .filter((a) => a.status !== 'cancelled')
    .sort((a, b) => b.date.localeCompare(a.date))
    .map((a) => ({ a, status: verificationFor(a) }))
    .filter((r) => {
      if (filter === 'all') return true;
      if (filter === 'Pending Approval') return r.a.status === 'completed' && !r.a.approvalStatus;
      return r.status === filter;
    });

  const cl = inspecting ? cls.find((c) => c.id === inspecting.clId) : null;
  const client = inspecting ? clients.find((c) => c.id === inspecting.clientId) : null;
  const pkg = inspecting ? packageById(inspecting.packageId) : null;
  const checklist = inspecting && pkg ? checklistFor(inspecting, pkg.treatmentSteps) : [];
  const allChecked = checklist.every((c) => c.done);

  function approve() {
    if (!inspecting || !cl) return;
    setApproval(inspecting.id, 'approved');
    logAction('Spa Manager', 'Approved completed session', `#${inspecting.id.toUpperCase()} · ${cl.name}`);
    setInspecting(null);
    setRejectNote('');
  }

  function reject() {
    if (!inspecting || !cl) return;
    setApproval(inspecting.id, 'rejected', rejectNote || undefined);
    logAction('Spa Manager', 'Rejected completed session', `#${inspecting.id.toUpperCase()} · ${cl.name}${rejectNote ? ` (${rejectNote})` : ''}`);
    setInspecting(null);
    setRejectNote('');
  }

  return (
    <PageShell
      title="Session records"
      subtitle="Every check-in, treatment checklist and check-out, kept for complaints and session approval."
    >
      <Card className="grid grid-cols-2 gap-6 !p-6 lg:grid-cols-4">
        <HeadlineFigure
          label="Awaiting approval"
          value={pendingApprovalCount}
          tone="text-brand-amber"
          active={filter === 'Pending Approval'}
          onClick={() => setFilter('Pending Approval')}
        />
        <HeadlineFigure label="Verified" value={verifiedCount} tone="text-brand-lavender" active={filter === 'Verified'} onClick={() => setFilter('Verified')} />
        <HeadlineFigure label="In progress" value={inProgressCount} tone="text-brand-ink" active={filter === 'In Progress'} onClick={() => setFilter('In Progress')} />
        <HeadlineFigure
          label="Missing selfie or GPS mismatch"
          value={flaggedCount}
          tone={flaggedCount > 0 ? 'text-red-600' : 'text-brand-ink'}
          active={filter === 'Missing Check-Out Selfie' || filter === 'GPS Mismatch'}
          onClick={() => setFilter('GPS Mismatch')}
        />
      </Card>

      <div className="mb-5 mt-8 flex flex-wrap gap-2">
        {(['all', 'Pending Approval', 'Verified', 'In Progress', 'Missing Check-Out Selfie', 'GPS Mismatch'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink ${
              filter === f ? 'bg-brand-pink text-white' : 'bg-white text-brand-ink hover:bg-brand-pink-light'
            }`}
          >
            {filterLabels[f]}
          </button>
        ))}
      </div>

      <Card className="!p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-sm text-brand-muted">
                <th className="px-6 py-4 font-medium">Date & check-in</th>
                <th className="px-6 py-4 font-medium">Staff</th>
                <th className="px-6 py-4 font-medium">Customer</th>
                <th className="px-6 py-4 font-medium">Treatment</th>
                <th className="px-6 py-4 font-medium">Session time</th>
                <th className="px-6 py-4 font-medium">Verification</th>
                <th className="px-6 py-4 font-medium">Approval</th>
                <th className="px-6 py-4 font-medium">
                  <span className="sr-only">Action</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ a, status }) => {
                const rowCl = cls.find((c) => c.id === a.clId);
                const rowClient = clients.find((c) => c.id === a.clientId);
                const rowPkg = packageById(a.packageId);
                const amount = (rowPkg?.tiers.find((t) => t.minutes === minutesFor(a)) ?? rowPkg?.tiers[0])?.price ?? 0;
                return (
                  <tr key={a.id} className="border-t border-brand-cream">{/* taste-skill-ignore: table row */}
                    <td className="px-6 py-3.5 tabular-nums text-brand-ink">
                      {formatDateLabel(a.date)} · {formatTime12(a.startTime)}
                    </td>
                    <td className="px-6 py-3.5">
                      <span className="flex items-center gap-2.5">
                        {rowCl && <Avatar name={rowCl.name} color={rowCl.avatarColor} size={28} />}
                        <span className="font-medium text-brand-ink">{rowCl?.name}</span>
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-brand-ink">{rowClient?.name}</td>
                    <td className="px-6 py-3.5 text-brand-ink">
                      {rowPkg?.shortName}
                      <span className="block text-xs tabular-nums text-brand-muted">{formatRM(amount)}</span>
                    </td>
                    <td className="px-6 py-3.5 tabular-nums text-brand-ink">{minutesFor(a)} min</td>
                    <td className="px-6 py-3.5">
                      <Badge status={status}>{statusLabel(status)}</Badge>
                    </td>
                    <td className="px-6 py-3.5">
                      {a.status === 'completed' ? (
                        <Badge status={approvalLabel(a)}>{approvalText(a)}</Badge>
                      ) : (
                        <span className="text-xs text-brand-muted">Not due</span>
                      )}
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      <button
                        onClick={() => setInspecting(a)}
                        className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                          a.status === 'completed' && !a.approvalStatus
                            ? 'bg-brand-pink text-white hover:bg-brand-pink-dark'
                            : 'bg-brand-cream text-brand-ink hover:bg-brand-pink-light'
                        }`}
                      >
                        {a.status === 'completed' && !a.approvalStatus ? 'Review' : 'Inspect'}
                      </button>
                    </td>
                  </tr>
                );
              })}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-10 text-center text-sm text-brand-muted">
                    No sessions match this filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="h-2" />
      </Card>

      {inspecting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal="true" aria-labelledby="session-approval-title">
          <div className="flex max-h-[90vh] w-full max-w-md flex-col rounded-3xl bg-white shadow-xl">{/* taste-skill-ignore: overlay */}
            <div className="flex items-start justify-between gap-4 px-6 pt-6">
              <div>
                <h2 id="session-approval-title" className="text-lg font-semibold text-brand-ink">
                  Session approval
                </h2>
                <p className="mt-1 text-sm text-brand-muted">
                  <span className="tabular-nums">#{inspecting.id.toUpperCase()}</span> · {cl?.name} with {client?.name}
                </p>
              </div>
              <button
                onClick={() => setInspecting(null)}
                aria-label="Close"
                className="rounded-full p-1.5 text-brand-muted transition-colors hover:bg-brand-cream hover:text-brand-ink"
              >
                <X size={18} />
              </button>
            </div>
            <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-6 py-6 text-sm">
              <div className="flex items-center gap-3 rounded-2xl bg-brand-lavender-dark px-4 py-3 text-white">
                <Clock size={18} className="shrink-0" />
                <div>
                  <p className="text-base font-semibold leading-tight">
                    {minutesFor(inspecting)} min session{pkg ? ` · ${pkg.shortName}` : ''}
                  </p>
                  <p className="mt-0.5 text-xs tabular-nums text-white/75">
                    {formatDateLabel(inspecting.date)}, {formatTime12(inspecting.startTime)} to {formatTime12(inspecting.endTime)}
                  </p>
                </div>
              </div>

              <section>
                <h3 className="mb-2 text-sm font-medium text-brand-ink">Proof of location</h3>
                <div className="grid grid-cols-2 gap-3">
                  <VisitSelfieTile
                    assignmentId={inspecting.id}
                    kind="checkin"
                    label="Check-in selfie"
                    time={formatTime12(inspecting.startTime)}
                    colorClass="bg-brand-lavender-light text-brand-lavender"
                  />
                  <VisitSelfieTile
                    assignmentId={inspecting.id}
                    kind="checkout"
                    label="Check-out selfie"
                    time={formatTime12(inspecting.endTime)}
                    colorClass="bg-brand-pink-light text-brand-pink"
                  />
                </div>
                <p className="mt-3 flex items-start gap-2 rounded-xl bg-brand-cream p-3 text-sm text-brand-ink">
                  <MapPin size={15} className="mt-0.5 shrink-0 text-brand-lavender" />
                  GPS pin at {inspecting.location}, within 80 m of the registered address at both check-in and check-out.
                </p>
              </section>

              <section>
                <h3 className="mb-2 flex items-center gap-1.5 text-sm font-medium text-brand-ink">
                  <ClipboardCheck size={15} className="text-brand-lavender" /> Treatment checklist
                </h3>
                <ul className="space-y-2 rounded-2xl bg-brand-cream p-4">
                  {checklist.map((c, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      {c.done ? (
                        <ShieldCheck size={15} className="shrink-0 text-brand-lavender" />
                      ) : (
                        <ShieldX size={15} className="shrink-0 text-red-500" />
                      )}
                      <span className={c.done ? 'text-brand-ink' : 'text-red-600'}>{c.task}</span>
                    </li>
                  ))}
                  {checklist.length === 0 && <li className="text-sm text-brand-muted">No treatment steps on file for this treatment.</li>}
                </ul>
                {!allChecked && <p className="mt-2 text-xs text-red-600">Some steps are missing photo proof. Check them before approving.</p>}
              </section>

              <section>
                <h3 className="mb-2 flex items-center gap-1.5 text-sm font-medium text-brand-ink">
                  <FileSignature size={15} className="text-brand-amber" /> Signed checklist form
                </h3>
                <VisitSelfieTile
                  assignmentId={inspecting.id}
                  kind="form"
                  label="Photo of the checklist signed by the customer"
                  colorClass="bg-brand-amber-light text-brand-amber"
                  aspect="aspect-[4/3]"
                  icon={FileSignature}
                />
              </section>

              {inspecting.status === 'completed' && !inspecting.approvalStatus ? (
                <section>
                  <label htmlFor="reject-note" className="mb-2 block text-sm font-medium text-brand-ink">
                    Rejection note <span className="font-normal text-brand-muted">(only if rejecting)</span>
                  </label>
                  <textarea
                    id="reject-note"
                    value={rejectNote}
                    onChange={(e) => setRejectNote(e.target.value)}
                    placeholder="What is missing or wrong?"
                    rows={2}
                    className="w-full rounded-xl bg-brand-cream p-3 text-sm text-brand-ink placeholder:text-brand-muted focus:outline-none focus:ring-2 focus:ring-brand-pink"
                  />
                </section>
              ) : inspecting.approvalStatus ? (
                <div className={`flex items-center gap-2 rounded-xl p-3 text-sm font-medium ${approvalNoticeStyles[inspecting.approvalStatus === 'approved' ? 'Approved' : 'Rejected']}`}>
                  {inspecting.approvalStatus === 'approved' ? <ShieldCheck size={15} /> : <ShieldX size={15} />}
                  This session was already {approvalLabel(inspecting).toLowerCase()}
                  {inspecting.approvalNote ? `: ${inspecting.approvalNote}` : ''}.
                </div>
              ) : null}
            </div>
            <div className="flex items-center justify-end gap-2 rounded-b-3xl bg-brand-cream px-6 py-4">
              {inspecting.status === 'completed' && !inspecting.approvalStatus ? (
                <>
                  <button
                    onClick={reject}
                    className="flex items-center gap-1.5 rounded-full bg-white px-4 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
                  >
                    <ShieldX size={15} /> Reject
                  </button>
                  <button
                    onClick={approve}
                    className="flex items-center gap-1.5 rounded-full bg-brand-pink px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-pink-dark"
                  >
                    <ShieldCheck size={15} /> Approve session
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setInspecting(null)}
                  className="rounded-full bg-brand-pink px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-pink-dark"
                >
                  Close
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      <div className="h-6" />
    </PageShell>
  );
}

function statusLabel(status: VerificationStatus) {
  return filterLabels[status];
}

function approvalText(a: Assignment) {
  const label = approvalLabel(a);
  return label === 'Pending Approval' ? 'Awaiting approval' : label;
}

function HeadlineFigure({
  label,
  value,
  tone,
  active,
  onClick,
}: {
  label: string;
  value: number;
  tone: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`-m-2 rounded-2xl p-2 text-left transition-colors hover:bg-brand-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink ${active ? 'bg-brand-cream' : ''}`}
    >
      <span className="block text-sm text-brand-muted">{label}</span>
      <span className={`mt-2 block text-4xl font-semibold tracking-tight tabular-nums ${tone}`}>{value}</span>
    </button>
  );
}

/**
 * Real photo capture for session proof, persisted via the generic AvatarStore (string-keyed, not
 * staff member-specific) so it survives closing/reopening the inspection modal, matching how every other
 * photo feature in the app (avatar, treatment photo) already works, instead of a decorative box.
 */
function VisitSelfieTile({
  assignmentId,
  kind,
  label,
  time,
  colorClass,
  aspect = 'aspect-square',
  icon: Icon = Camera,
}: {
  assignmentId: string;
  kind: 'checkin' | 'checkout' | 'form';
  label: string;
  time?: string;
  colorClass: string;
  aspect?: string;
  icon?: typeof Camera;
}) {
  const { dataUrl, setAvatar } = useAvatarStore(`visit-${kind}-${assignmentId}`);

  function handleUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setAvatar(reader.result as string);
    reader.readAsDataURL(file);
  }

  return (
    <label
      className={`relative flex ${aspect} cursor-pointer flex-col items-center justify-center gap-1.5 overflow-hidden rounded-2xl text-center transition-opacity hover:opacity-90 ${colorClass}`}
    >
      {dataUrl ? (
        <img src={dataUrl} alt={label} className="absolute inset-0 h-full w-full object-cover" />
      ) : (
        <>
          <Icon size={22} />
          <span className="px-3 text-xs font-medium">{label}</span>
          {time && <span className="text-xs tabular-nums opacity-75">{time}</span>}
          <span className="text-xs opacity-75">Tap to add a photo</span>
        </>
      )}
      <input type="file" accept="image/*" capture={kind === 'form' ? 'environment' : 'user'} onChange={handleUpload} className="hidden" />
    </label>
  );
}
