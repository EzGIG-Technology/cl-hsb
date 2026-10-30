import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { PageShell } from '../components/PageShell';
import { Card, Avatar, Badge } from '../components/ui';
import { useCLStore } from '../store/CLStore';
import { useClientStore } from '../store/ClientStore';
import { useActivityLog } from '../store/ActivityLogContext';
import { useDisputeStore } from '../store/DisputeStore';
import { formatDateLabel } from '../lib/date';

export default function DisputesPage() {
  const { cls } = useCLStore();
  const { clients } = useClientStore();
  const { logAction } = useActivityLog();
  const { disputes, resolveDispute } = useDisputeStore();
  const [filter, setFilter] = useState<'Open' | 'Resolved'>('Open');

  const filtered = disputes.filter((d) => d.status === filter);

  function resolve(id: string) {
    const dispute = disputes.find((d) => d.id === id);
    resolveDispute(id);
    logAction('Front Desk', 'Resolved complaint', `${id} · ${dispute?.issue}`);
  }

  const openCount = disputes.filter((d) => d.status === 'Open').length;
  const highOpenCount = disputes.filter((d) => d.status === 'Open' && d.severity === 'High').length;
  const resolvedCount = disputes.length - openCount;

  return (
    <PageShell
      title="Complaints"
      subtitle="Customer complaints and missed session steps, reviewed before payroll is released."
      icon={AlertTriangle}
    >
      <Card className="grid grid-cols-1 gap-6 !p-6 sm:grid-cols-3">
        <Figure label="Open" value={openCount} tone={openCount > 0 ? 'text-brand-amber' : 'text-brand-ink'} />
        <Figure label="Open with high severity" value={highOpenCount} tone={highOpenCount > 0 ? 'text-red-600' : 'text-brand-ink'} />
        <Figure label="Resolved" value={resolvedCount} tone="text-brand-lavender" />
      </Card>

      <div className="mb-5 mt-8 flex gap-2" role="tablist">
        {(['Open', 'Resolved'] as const).map((f) => (
          <button
            key={f}
            role="tab"
            aria-selected={filter === f}
            onClick={() => setFilter(f)}
            className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink ${
              filter === f ? 'bg-brand-pink text-white' : 'bg-white text-brand-ink hover:bg-brand-pink-light'
            }`}
          >
            {f}
            <span
              className={`min-w-6 rounded-full px-1.5 text-center text-xs tabular-nums ${
                filter === f ? 'bg-white/20 text-white' : 'bg-brand-cream text-brand-muted'
              }`}
            >
              {f === 'Open' ? openCount : resolvedCount}
            </span>
          </button>
        ))}
      </div>

      <Card className="!p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-sm text-brand-muted">
                <th className="px-6 py-4 font-medium">Ref</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Staff</th>
                <th className="px-6 py-4 font-medium">Customer</th>
                <th className="px-6 py-4 font-medium">Complaint</th>
                <th className="px-6 py-4 font-medium">Severity</th>
                <th className="px-6 py-4 font-medium">
                  <span className="sr-only">Action</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((d) => {
                const cl = cls.find((c) => c.id === d.clId);
                const client = clients.find((c) => c.id === d.clientId);
                return (
                  <tr key={d.id} className="border-t border-brand-cream align-top">{/* taste-skill-ignore: table row */}
                    <td className="px-6 py-4 tabular-nums text-brand-muted">{d.id}</td>
                    <td className="whitespace-nowrap px-6 py-4 tabular-nums text-brand-ink">{formatDateLabel(d.date)}</td>
                    <td className="px-6 py-4">
                      <span className="flex items-center gap-2.5">
                        {cl && <Avatar name={cl.name} color={cl.avatarColor} size={28} />}
                        <span className="font-medium text-brand-ink">{cl?.name}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 text-brand-ink">{client?.name}</td>
                    <td className="max-w-md px-6 py-4">
                      <p className="font-medium text-brand-ink">{d.issue}</p>
                      <p className="mt-0.5 text-sm text-brand-muted">{d.detail}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`flex w-fit items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
                          d.severity === 'High' ? 'bg-red-100 text-red-600' : 'bg-brand-amber-light text-brand-amber'
                        }`}
                      >
                        <AlertTriangle size={12} /> {d.severity}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {d.status === 'Open' ? (
                        <button
                          onClick={() => resolve(d.id)}
                          className="rounded-full bg-brand-pink-light px-4 py-1.5 text-sm font-medium text-brand-pink transition-colors hover:bg-brand-pink hover:text-white"
                        >
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
                  <td colSpan={7} className="px-6 py-10 text-center text-sm text-brand-muted">
                    No {filter.toLowerCase()} complaints.
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

function Figure({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <div>
      <p className="text-sm text-brand-muted">{label}</p>
      <p className={`mt-2 text-4xl font-semibold tracking-tight tabular-nums ${tone}`}>{value}</p>
    </div>
  );
}
