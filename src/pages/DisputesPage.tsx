import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { PageShell } from '../components/PageShell';
import { Card, Avatar, Badge } from '../components/ui';
import { useCLStore } from '../store/CLStore';
import { useClientStore } from '../store/ClientStore';
import { useActivityLog } from '../store/ActivityLogContext';
import { disputes as seedDisputes, type Dispute } from '../data/disputes';
import { formatDateLabel } from '../lib/date';

export default function DisputesPage() {
  const { cls } = useCLStore();
  const { clients } = useClientStore();
  const { logAction } = useActivityLog();
  const [disputes, setDisputes] = useState<Dispute[]>(seedDisputes);
  const [filter, setFilter] = useState<'Open' | 'Resolved'>('Open');

  const filtered = disputes.filter((d) => d.status === filter);

  function resolve(id: string) {
    const dispute = disputes.find((d) => d.id === id);
    setDisputes((prev) => prev.map((d) => (d.id === id ? { ...d, status: 'Resolved' } : d)));
    logAction('Admin Amy', 'Resolved dispute', `${id} — ${dispute?.issue}`);
  }

  return (
    <PageShell title="Disputes & Exceptions Center" subtitle="Missed visit-flow steps, flagged for review before payroll release.">
      <div className="mb-4 flex gap-2">
        {(['Open', 'Resolved'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              filter === f ? 'bg-brand-pink text-white' : 'border border-black/10 bg-white text-brand-ink hover:bg-brand-cream'
            }`}
          >
            {f} ({disputes.filter((d) => d.status === f).length})
          </button>
        ))}
      </div>

      <Card className="!p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-brand-muted">
                <th className="px-5 py-3 font-medium">Ticket</th>
                <th className="px-5 py-3 font-medium">Date</th>
                <th className="px-5 py-3 font-medium">Caregiver</th>
                <th className="px-5 py-3 font-medium">Customer</th>
                <th className="px-5 py-3 font-medium">Missed step</th>
                <th className="px-5 py-3 font-medium">Severity</th>
                <th className="px-5 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((d) => {
                const cl = cls.find((c) => c.id === d.clId);
                const client = clients.find((c) => c.id === d.clientId);
                return (
                  <tr key={d.id} className="border-t border-black/5">
                    <td className="px-5 py-3 font-mono text-xs text-brand-muted">{d.id}</td>
                    <td className="px-5 py-3 text-brand-muted">{formatDateLabel(d.date)}</td>
                    <td className="flex items-center gap-2 px-5 py-3">
                      {cl && <Avatar name={cl.name} color={cl.avatarColor} size={24} />}
                      <span className="text-brand-ink">{cl?.name}</span>
                    </td>
                    <td className="px-5 py-3 text-brand-muted">{client?.name}</td>
                    <td className="px-5 py-3">
                      <p className="text-brand-ink">{d.issue}</p>
                      <p className="text-xs text-brand-muted">{d.detail}</p>
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`flex w-fit items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
                          d.severity === 'High' ? 'bg-red-100 text-red-600' : 'bg-brand-amber-light text-brand-amber'
                        }`}
                      >
                        <AlertTriangle size={11} /> {d.severity}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      {d.status === 'Open' ? (
                        <button onClick={() => resolve(d.id)} className="text-xs font-medium text-brand-pink hover:underline">
                          Resolve
                        </button>
                      ) : (
                        <Badge status="completed">Resolved</Badge>
                      )}
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-6 text-center text-sm text-brand-muted">
                    No {filter.toLowerCase()} disputes.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="h-2" />
      </Card>
      <div className="h-6" />
    </PageShell>
  );
}
