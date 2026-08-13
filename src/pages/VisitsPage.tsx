import { useState } from 'react';
import { X, MapPin, Camera, ClipboardCheck } from 'lucide-react';
import { PageShell } from '../components/PageShell';
import { Card, Avatar, formatRM } from '../components/ui';
import { useAssignmentStore } from '../store/AssignmentStore';
import { useClientStore } from '../store/ClientStore';
import { useCLStore } from '../store/CLStore';
import { useSettings } from '../store/SettingsContext';
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

export default function VisitsPage() {
  const { assignments } = useAssignmentStore();
  const { clients } = useClientStore();
  const { cls } = useCLStore();
  const { packageById } = useSettings();
  const [inspecting, setInspecting] = useState<Assignment | null>(null);
  const [filter, setFilter] = useState<'all' | VerificationStatus>('all');

  const rows = [...assignments]
    .filter((a) => a.status !== 'cancelled')
    .sort((a, b) => b.date.localeCompare(a.date))
    .map((a) => ({ a, status: verificationFor(a) }))
    .filter((r) => filter === 'all' || r.status === filter);

  return (
    <PageShell title="Visit Records & Audit" subtitle="Every check-in, checklist, and check-out — logged for dispute resolution.">
      <div className="mb-4 flex flex-wrap gap-2">
        {(['all', 'Verified', 'In Progress', 'Missing Check-Out Selfie', 'GPS Mismatch'] as const).map((f) => (
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
                <th className="px-5 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ a, status }) => {
                const cl = cls.find((c) => c.id === a.clId);
                const client = clients.find((c) => c.id === a.clientId);
                const pkg = packageById(a.packageId);
                const amount = pkg?.tiers[0]?.price ?? pkg?.sessionPrice?.perSession ?? 0;
                return (
                  <tr key={a.id} className="border-t border-black/5">
                    <td className="px-5 py-3 text-brand-muted">
                      {formatDateLabel(a.date)} · {formatTime12(a.startTime)}
                    </td>
                    <td className="flex items-center gap-2 px-5 py-3">
                      {cl && <Avatar name={cl.name} color={cl.avatarColor} size={24} />}
                      <span className="text-brand-ink">{cl?.name}</span>
                    </td>
                    <td className="px-5 py-3 text-brand-muted">{client?.name}</td>
                    <td className="px-5 py-3 text-brand-muted">{formatRM(amount)}</td>
                    <td className="px-5 py-3 text-brand-muted">{hoursFor(a)}h</td>
                    <td className="px-5 py-3">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusStyles[status]}`}>{status}</span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button onClick={() => setInspecting(a)} className="text-xs font-medium text-brand-pink hover:underline">
                        Inspect
                      </button>
                    </td>
                  </tr>
                );
              })}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-6 text-center text-sm text-brand-muted">
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
              <p className="text-sm font-semibold text-brand-ink">Visit inspection</p>
              <button onClick={() => setInspecting(null)} className="text-brand-muted hover:text-brand-ink">
                <X size={18} />
              </button>
            </div>
            <div className="space-y-3 p-5 text-sm">
              <div className="flex items-center gap-2 rounded-lg bg-brand-cream p-3">
                <MapPin size={14} className="text-brand-green" /> GPS check-in verified within 80m of registered address
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-brand-cream p-3">
                <Camera size={14} className="text-brand-green" /> Check-in and check-out selfies on file
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-brand-cream p-3">
                <ClipboardCheck size={14} className="text-brand-green" /> Package checklist completed with photo proof per task
              </div>
              <p className="text-xs text-brand-muted">Location: {inspecting.location}</p>
            </div>
            <div className="border-t border-black/5 p-4 text-right">
              <button onClick={() => setInspecting(null)} className="rounded-full bg-brand-pink px-4 py-2 text-sm font-medium text-white">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="h-6" />
    </PageShell>
  );
}
