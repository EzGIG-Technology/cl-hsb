import { useState } from 'react';
import { X, MapPin, Camera, ClipboardCheck, ShieldCheck, ShieldX, ShieldQuestion, FileSignature, Clock } from 'lucide-react';
import { PageShell } from '../components/PageShell';
import { Card, Avatar, formatRM } from '../components/ui';
import { useAssignmentStore } from '../store/AssignmentStore';
import { useClientStore } from '../store/ClientStore';
import { useCLStore } from '../store/CLStore';
import { useSettings } from '../store/SettingsContext';
import { useActivityLog } from '../store/ActivityLogContext';
import { formatDateLabel, formatTime12 } from '../lib/date';
import type { Assignment } from '../types';

type VerificationStatus = 'Verified' | 'In Progress' | 'Missing Check-Out Selfie' | 'GPS Mismatch';

const statusStyles: Record<VerificationStatus, string> = {
  Verified: 'bg-brand-green-light text-brand-green',
  'In Progress': 'bg-brand-amber-light text-brand-amber',
  'Missing Check-Out Selfie': 'bg-red-100 text-red-600',
  'GPS Mismatch': 'bg-red-100 text-red-600',
};

function verificationFor(a: Assignment): VerificationStatus {
  if (a.status === 'confirmed' || a.status === 'pending') return 'In Progress';
  if (a.status !== 'completed') return 'Verified';
  const hash = a.id.split('').reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
  if (hash % 11 === 0) return 'GPS Mismatch';
  if (hash % 13 === 0) return 'Missing Check-Out Selfie';
  return 'Verified';
}

function hoursFor(a: Assignment) {
  const [sh, sm] = a.startTime.split(':').map(Number);
  const [eh, em] = a.endTime.split(':').map(Number);
  return Math.round(((eh * 60 + em - (sh * 60 + sm)) / 60) * 10) / 10;
}

const approvalStyles: Record<'Pending Approval' | 'Approved' | 'Rejected', string> = {
  'Pending Approval': 'bg-brand-amber-light text-brand-amber',
  Approved: 'bg-brand-green-light text-brand-green',
  Rejected: 'bg-red-100 text-red-600',
};

function approvalLabel(a: Assignment): 'Pending Approval' | 'Approved' | 'Rejected' {
  if (a.approvalStatus === 'approved') return 'Approved';
  if (a.approvalStatus === 'rejected') return 'Rejected';
  return 'Pending Approval';
}

/** Deterministic mock checklist for the package tied to this visit, so the approval panel has something concrete to review. */
function checklistFor(a: Assignment, pkgTasks: string[]) {
  const hash = a.id.split('').reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
  return pkgTasks.slice(0, 5).map((task, i) => ({ task, done: (hash + i) % 9 !== 0 }));
}

export default function VisitsPage() {
  const { assignments, setApproval } = useAssignmentStore();
  const { clients } = useClientStore();
  const { cls } = useCLStore();
  const { packageById } = useSettings();
  const { logAction } = useActivityLog();
  const [inspecting, setInspecting] = useState<Assignment | null>(null);
  const [filter, setFilter] = useState<'all' | VerificationStatus | 'Pending Approval'>('all');
  const [rejectNote, setRejectNote] = useState('');

  const pendingApprovalCount = assignments.filter((a) => a.status === 'completed' && !a.approvalStatus).length;

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
  const checklist = inspecting && pkg ? checklistFor(inspecting, [...pkg.dailyMotherCare, ...pkg.babyCare]) : [];
  const allChecked = checklist.every((c) => c.done);

  function approve() {
    if (!inspecting || !cl) return;
    setApproval(inspecting.id, 'approved');
    logAction('Superadmin', 'Approved completed session', `#${inspecting.id.toUpperCase()} — ${cl.name}`);
    setInspecting(null);
    setRejectNote('');
  }

  function reject() {
    if (!inspecting || !cl) return;
    setApproval(inspecting.id, 'rejected', rejectNote || undefined);
    logAction('Superadmin', 'Rejected completed session', `#${inspecting.id.toUpperCase()} — ${cl.name}${rejectNote ? ` (${rejectNote})` : ''}`);
    setInspecting(null);
    setRejectNote('');
  }

  return (
    <PageShell
      title="Visit Records & Audit"
      subtitle="Every check-in, checklist, and check-out — logged for dispute resolution and session approval."
    >
      {pendingApprovalCount > 0 && (
        <button
          onClick={() => setFilter('Pending Approval')}
          className="mb-4 flex w-full items-center gap-2 rounded-xl border border-brand-amber/30 bg-brand-amber-light px-4 py-2.5 text-sm text-brand-amber hover:bg-brand-amber-light/70"
        >
          <ShieldQuestion size={15} className="shrink-0" />
          {pendingApprovalCount} completed session{pendingApprovalCount === 1 ? '' : 's'} awaiting Superadmin approval — review selfies & checklist below.
        </button>
      )}

      <div className="mb-4 flex flex-wrap gap-2">
        {(['all', 'Pending Approval', 'Verified', 'In Progress', 'Missing Check-Out Selfie', 'GPS Mismatch'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
              filter === f ? 'bg-brand-pink text-white' : 'border border-black/10 bg-white text-brand-ink hover:bg-brand-cream'
            }`}
          >
            {f === 'all' ? 'All' : f}
          </button>
        ))}
      </div>

      <Card className="!p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-brand-muted">
                <th className="px-5 py-3 font-medium">Date / clock-in</th>
                <th className="px-5 py-3 font-medium">Caregiver</th>
                <th className="px-5 py-3 font-medium">Customer</th>
                <th className="px-5 py-3 font-medium">Job amount</th>
                <th className="px-5 py-3 font-medium">Actual hours</th>
                <th className="px-5 py-3 font-medium">Verification</th>
                <th className="px-5 py-3 font-medium">Approval</th>
                <th className="px-5 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ a, status }) => {
                const rowCl = cls.find((c) => c.id === a.clId);
                const rowClient = clients.find((c) => c.id === a.clientId);
                const rowPkg = packageById(a.packageId);
                const amount = rowPkg?.tiers[0]?.price ?? rowPkg?.sessionPrice?.perSession ?? 0;
                return (
                  <tr key={a.id} className="border-t border-black/5">
                    <td className="px-5 py-3 text-brand-muted">
                      {formatDateLabel(a.date)} · {formatTime12(a.startTime)}
                    </td>
                    <td className="flex items-center gap-2 px-5 py-3">
                      {rowCl && <Avatar name={rowCl.name} color={rowCl.avatarColor} size={24} />}
                      <span className="text-brand-ink">{rowCl?.name}</span>
                    </td>
                    <td className="px-5 py-3 text-brand-muted">{rowClient?.name}</td>
                    <td className="px-5 py-3 text-brand-muted">{formatRM(amount)}</td>
                    <td className="px-5 py-3 text-brand-muted">{hoursFor(a)}h</td>
                    <td className="px-5 py-3">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusStyles[status]}`}>{status}</span>
                    </td>
                    <td className="px-5 py-3">
                      {a.status === 'completed' ? (
                        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${approvalStyles[approvalLabel(a)]}`}>
                          {approvalLabel(a)}
                        </span>
                      ) : (
                        <span className="text-xs text-brand-muted">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button onClick={() => setInspecting(a)} className="text-xs font-medium text-brand-pink hover:underline">
                        {a.status === 'completed' && !a.approvalStatus ? 'Review & Approve' : 'Inspect'}
                      </button>
                    </td>
                  </tr>
                );
              })}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-5 py-6 text-center text-sm text-brand-muted">
                    No visits match this filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="h-2" />
      </Card>

      {inspecting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-black/5 p-4">
              <div>
                <p className="text-sm font-semibold text-brand-ink">Session approval</p>
                <p className="text-xs text-brand-muted">
                  #{inspecting.id.toUpperCase()} — {cl?.name} for {client?.name}
                </p>
              </div>
              <button onClick={() => setInspecting(null)} className="text-brand-muted hover:text-brand-ink">
                <X size={18} />
              </button>
            </div>
            <div className="max-h-[65vh] space-y-4 overflow-y-auto p-5 text-sm">
              <div className="flex items-center gap-2 rounded-xl bg-brand-ink px-3 py-2.5 text-white">
                <Clock size={15} className="shrink-0" />
                <div>
                  <p className="text-sm font-semibold leading-tight">{hoursFor(inspecting)}h total session time</p>
                  <p className="text-[11px] text-white/70">
                    {formatTime12(inspecting.startTime)} – {formatTime12(inspecting.endTime)}
                  </p>
                </div>
              </div>

              <div>
                <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-brand-muted">Proof of location selfies</p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex aspect-square flex-col items-center justify-center gap-1 rounded-xl bg-gradient-to-br from-brand-green-light to-brand-green/20 text-brand-green">
                    <Camera size={20} />
                    <span className="text-[10px] font-medium">Before — check-in selfie</span>
                    <span className="text-[9px] text-brand-green/70">{formatTime12(inspecting.startTime)}</span>
                  </div>
                  <div className="flex aspect-square flex-col items-center justify-center gap-1 rounded-xl bg-gradient-to-br from-brand-pink-light to-brand-pink/20 text-brand-pink">
                    <Camera size={20} />
                    <span className="text-[10px] font-medium">After — check-out selfie</span>
                    <span className="text-[9px] text-brand-pink/70">{formatTime12(inspecting.endTime)}</span>
                  </div>
                </div>
                <div className="mt-2 flex items-center gap-2 rounded-lg bg-brand-cream p-2.5 text-xs text-brand-ink">
                  <MapPin size={13} className="shrink-0 text-brand-green" /> GPS pin at {inspecting.location} — within 80m of registered address, matched both check-in and check-out
                </div>
              </div>

              <div>
                <p className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-brand-muted">
                  <ClipboardCheck size={13} /> Package checklist
                </p>
                <div className="space-y-1.5 rounded-xl border border-black/5 p-2.5">
                  {checklist.map((c, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      {c.done ? (
                        <ShieldCheck size={13} className="shrink-0 text-brand-green" />
                      ) : (
                        <ShieldX size={13} className="shrink-0 text-red-500" />
                      )}
                      <span className={c.done ? 'text-brand-ink' : 'text-red-600'}>{c.task}</span>
                    </div>
                  ))}
                  {checklist.length === 0 && <p className="text-xs text-brand-muted">No checklist tasks on file for this package.</p>}
                </div>
                {!allChecked && (
                  <p className="mt-1.5 text-[11px] text-red-600">Some checklist items are missing photo proof — review before approving.</p>
                )}
              </div>

              <div>
                <p className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-brand-muted">
                  <FileSignature size={13} /> Signed checklist form
                </p>
                <div className="flex aspect-[4/3] flex-col items-center justify-center gap-1.5 rounded-xl bg-gradient-to-br from-brand-amber-light to-brand-amber/20 text-brand-amber">
                  <FileSignature size={22} />
                  <span className="text-[10px] font-medium">Customer-signed checklist photo, taken at end of session</span>
                </div>
              </div>

              {inspecting.status === 'completed' && !inspecting.approvalStatus ? (
                <div>
                  <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-brand-muted">Rejection note (if rejecting)</p>
                  <textarea
                    value={rejectNote}
                    onChange={(e) => setRejectNote(e.target.value)}
                    placeholder="Optional — explain what's missing or wrong"
                    rows={2}
                    className="w-full rounded-lg border border-black/10 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-pink"
                  />
                </div>
              ) : inspecting.approvalStatus ? (
                <div className={`flex items-center gap-2 rounded-lg p-3 text-xs font-medium ${approvalStyles[approvalLabel(inspecting)]}`}>
                  {inspecting.approvalStatus === 'approved' ? <ShieldCheck size={14} /> : <ShieldX size={14} />}
                  This session was already {approvalLabel(inspecting).toLowerCase()}
                  {inspecting.approvalNote ? ` — ${inspecting.approvalNote}` : ''}.
                </div>
              ) : null}
            </div>
            <div className="flex items-center justify-end gap-2 border-t border-black/5 p-4">
              {inspecting.status === 'completed' && !inspecting.approvalStatus ? (
                <>
                  <button onClick={reject} className="flex items-center gap-1.5 rounded-full border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50">
                    <ShieldX size={14} /> Reject
                  </button>
                  <button onClick={approve} className="flex items-center gap-1.5 rounded-full bg-brand-green px-4 py-2 text-sm font-medium text-white hover:opacity-90">
                    <ShieldCheck size={14} /> Approve session
                  </button>
                </>
              ) : (
                <button onClick={() => setInspecting(null)} className="rounded-full bg-brand-pink px-4 py-2 text-sm font-medium text-white">
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
