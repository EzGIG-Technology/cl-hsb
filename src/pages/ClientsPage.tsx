import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageShell } from '../components/PageShell';
import { Card, Badge, Avatar } from '../components/ui';
import { useSettings } from '../store/SettingsContext';
import { useClientStore } from '../store/ClientStore';
import { assignments } from '../data/assignments';

export default function ClientsPage() {
  const { packageById } = useSettings();
  const { clients } = useClientStore();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  const bookingCounts = useMemo(() => {
    const map: Record<string, number> = {};
    assignments.forEach((a) => {
      map[a.clientId] = (map[a.clientId] ?? 0) + 1;
    });
    return map;
  }, []);

  const filtered = clients.filter(
    (c) => c.name.toLowerCase().includes(query.toLowerCase()) || c.location.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <PageShell
      title="Customer Directory"
      subtitle={`${clients.length} customers on file`}
      searchPlaceholder="Search customer by name or area"
      onSearch={setQuery}
    >
      <Card className="!p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-brand-muted">
                <th className="px-5 py-3 font-medium">Customer</th>
                <th className="px-5 py-3 font-medium">Phone</th>
                <th className="px-5 py-3 font-medium">Base area</th>
                <th className="px-5 py-3 font-medium">Packages</th>
                <th className="px-5 py-3 font-medium">Total bookings</th>
                <th className="px-5 py-3 font-medium">Type</th>
                <th className="px-5 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => {
                const bookings = bookingCounts[c.id] ?? 0;
                const returning = c.packageIds.length > 1 || bookings > 1;
                return (
                  <tr key={c.id} className="border-t border-black/5 hover:bg-brand-cream/60">
                    <td className="flex items-center gap-2 px-5 py-3">
                      <Avatar name={c.name} size={28} />
                      <span className="text-brand-ink">{c.name}</span>
                    </td>
                    <td className="px-5 py-3 text-brand-muted">{c.phone}</td>
                    <td className="px-5 py-3 text-brand-muted">{c.location}</td>
                    <td className="px-5 py-3">
                      <div className="flex flex-wrap gap-1">
                        {c.packageIds.map((pid) => (
                          <span key={pid} className="rounded-full bg-brand-pink-light px-2 py-0.5 text-[11px] font-medium text-brand-pink">
                            {packageById(pid)?.shortName ?? pid}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-5 py-3 text-brand-muted">{bookings}</td>
                    <td className="px-5 py-3">
                      <Badge status={returning ? 'completed' : 'upcoming'}>{returning ? 'Returning' : 'New'}</Badge>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button onClick={() => navigate(`/clients/${c.id}`)} className="text-xs font-medium text-brand-pink hover:underline">
                        View
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-6 text-center text-sm text-brand-muted">
                    No customers match your search.
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
