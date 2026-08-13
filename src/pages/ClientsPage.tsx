import { useMemo, useState } from 'react';
import { Phone, Mail, MapPin, X, Info } from 'lucide-react';
import { PageShell } from '../components/PageShell';
import { Card, Badge, Avatar } from '../components/ui';
import { clients } from '../data/clients';
import { useSettings } from '../store/SettingsContext';
import { formatDateLabel } from '../lib/date';
import type { Client } from '../types';

const filters: { label: string; value: Client['status'] | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Upcoming', value: 'upcoming' },
  { label: 'Completed', value: 'completed' },
];

export default function ClientsPage() {
  const { packageById } = useSettings();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Client['status'] | 'all'>('all');
  const [selected, setSelected] = useState<Client | null>(null);

  const counts = useMemo(() => {
    const base: Record<string, number> = { active: 0, upcoming: 0, completed: 0 };
    clients.forEach((c) => (base[c.status] += 1));
    return base;
  }, []);

  const filtered = clients.filter((c) => {
    const matchesQuery = c.name.toLowerCase().includes(query.toLowerCase()) || c.location.toLowerCase().includes(query.toLowerCase());
    const matchesFilter = filter === 'all' ? true : c.status === filter;
    return matchesQuery && matchesFilter;
  });

  return (
    <PageShell
      title="Clients"
      subtitle={`${clients.length} customers on file`}
      searchPlaceholder="Search client by name or area"
      onSearch={setQuery}
      sidePanel={
        <div className="flex flex-1 flex-col gap-4">
          <div className="grid grid-cols-3 gap-3">
            {(['active', 'upcoming', 'completed'] as const).map((s) => (
              <div key={s} className="rounded-xl bg-white/10 p-3 text-center">
                <p className="text-2xl font-semibold">{counts[s]}</p>
                <p className="text-xs capitalize text-white/60">{s}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-1">
            {filters.map((f) => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={`rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                  filter === f.value ? 'bg-white font-medium text-brand-maroon-dark' : 'text-white/80 hover:bg-white/10'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="flex-1">
            {selected ? (
              <ClientDetail client={selected} onClose={() => setSelected(null)} />
            ) : (
              <div className="rounded-2xl bg-white/10 p-4 text-sm text-white/70">
                Click a client to see full contact details and notes here.
              </div>
            )}
          </div>
        </div>
      }
    >
      <Card className="mt-4 !p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-brand-muted">
                <th className="px-5 py-3 font-medium">Client</th>
                <th className="px-5 py-3 font-medium">Package</th>
                <th className="px-5 py-3 font-medium">Location</th>
                <th className="px-5 py-3 font-medium">Due / birth date</th>
                <th className="px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => {
                const pkg = packageById(c.packageId);
                return (
                  <tr
                    key={c.id}
                    onClick={() => setSelected(c)}
                    className="cursor-pointer border-t border-black/5 hover:bg-brand-cream"
                  >
                    <td className="flex items-center gap-2 px-5 py-3">
                      <Avatar name={c.name} size={26} />
                      {c.name}
                    </td>
                    <td className="px-5 py-3">
                      <span className="rounded-full bg-brand-pink-light px-2.5 py-1 text-xs font-medium text-brand-maroon">
                        {pkg?.shortName}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-brand-muted">{c.location}</td>
                    <td className="px-5 py-3 text-brand-muted">{formatDateLabel(c.dueOrBirthDate)}</td>
                    <td className="px-5 py-3">
                      <Badge status={c.status}>{c.status}</Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && <p className="p-5 text-sm text-brand-muted">No clients match your search.</p>}
        <div className="h-2" />
      </Card>
      <div className="h-6" />
    </PageShell>
  );
}

function ClientDetail({ client, onClose }: { client: Client; onClose: () => void }) {
  const { packageById } = useSettings();
  const pkg = packageById(client.packageId);
  return (
    <div className="rounded-2xl bg-white/10 p-4">
      <div className="mb-3 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Avatar name={client.name} size={40} />
          <div>
            <p className="font-semibold">{client.name}</p>
            <p className="text-xs text-white/60">{pkg?.name}</p>
          </div>
        </div>
        <button onClick={onClose} className="text-white/60 hover:text-white">
          <X size={14} />
        </button>
      </div>
      <div className="space-y-2 text-sm text-white/85">
        <p className="flex items-center gap-2">
          <Phone size={14} /> {client.phone}
        </p>
        <p className="flex items-center gap-2">
          <Mail size={14} /> {client.email}
        </p>
        <p className="flex items-center gap-2">
          <MapPin size={14} /> {client.address}
        </p>
        <p>Due / birth date: {formatDateLabel(client.dueOrBirthDate)}</p>
        <Badge status={client.status}>{client.status}</Badge>
        {client.notes && (
          <p className="mt-2 flex items-start gap-2 rounded-lg bg-white/10 p-2 text-xs">
            <Info size={14} className="mt-0.5 shrink-0" /> {client.notes}
          </p>
        )}
      </div>
    </div>
  );
}
