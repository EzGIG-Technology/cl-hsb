import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, X, MapPin, Phone, CalendarClock, Contact } from 'lucide-react';
import { PageShell } from '../components/PageShell';
import { Card, Badge, Avatar } from '../components/ui';
import { useSettings } from '../store/SettingsContext';
import { useClientStore } from '../store/ClientStore';
import { useCLStore } from '../store/CLStore';
import { useAssignmentStore } from '../store/AssignmentStore';
import { useActivityLog } from '../store/ActivityLogContext';
import { formatDateLabel, formatTime12, TODAY_STR } from '../lib/date';

type DirectoryTab = 'active' | 'upcoming';

export default function ClientsPage() {
  const { packageById } = useSettings();
  const { clients, addClient } = useClientStore();
  const { clById } = useCLStore();
  const { assignments } = useAssignmentStore();
  const { logAction } = useActivityLog();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState<DirectoryTab>('active');
  const [showAdd, setShowAdd] = useState(false);

  const bookingCounts = useMemo(() => {
    const map: Record<string, number> = {};
    assignments.forEach((a) => {
      map[a.clientId] = (map[a.clientId] ?? 0) + 1;
    });
    return map;
  }, [assignments]);

  const activeCustomers = clients.filter((c) => c.packageIds.length > 0);
  const upcomingSessions = assignments
    .filter((a) => a.date >= TODAY_STR && (a.status === 'confirmed' || a.status === 'pending'))
    .sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime));

  const filtered = activeCustomers.filter(
    (c) => c.name.toLowerCase().includes(query.toLowerCase()) || c.location.toLowerCase().includes(query.toLowerCase()),
  );
  const filteredUpcoming = upcomingSessions.filter((a) => {
    const client = clients.find((c) => c.id === a.clientId);
    return !query || client?.name.toLowerCase().includes(query.toLowerCase()) || a.location.toLowerCase().includes(query.toLowerCase());
  });

  function handleAdd(input: { name: string; phone: string; location: string }) {
    const client = addClient(input);
    logAction('Admin Amy', 'Added new customer', client.name);
    setShowAdd(false);
    navigate(`/clients/${client.id}`);
  }

  return (
    <PageShell
      title="Customer Directory"
      subtitle={`${clients.length} customers on file — ${activeCustomers.length} active with packages`}
      icon={Contact}
      accentColor="#d94f8c"
      searchPlaceholder="Search customer by name or area"
      onSearch={setQuery}
      headerAction={
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-1.5 rounded-full bg-brand-pink px-4 py-2 text-sm font-medium text-white hover:bg-brand-pink-dark"
        >
          <UserPlus size={15} /> Add Customer
        </button>
      }
    >
      <div className="mb-4 flex flex-wrap gap-2">
        <button
          onClick={() => setTab('active')}
          className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
            tab === 'active' ? 'bg-brand-pink text-white' : 'border border-black/10 bg-white text-brand-ink hover:bg-brand-cream'
          }`}
        >
          Active Customers
          <span className={`rounded-full px-1.5 text-xs ${tab === 'active' ? 'bg-white/20' : 'bg-brand-cream'}`}>{activeCustomers.length}</span>
        </button>
        <button
          onClick={() => setTab('upcoming')}
          className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
            tab === 'upcoming' ? 'bg-brand-pink text-white' : 'border border-black/10 bg-white text-brand-ink hover:bg-brand-cream'
          }`}
        >
          Upcoming Sessions
          <span className={`rounded-full px-1.5 text-xs ${tab === 'upcoming' ? 'bg-white/20' : 'bg-brand-cream'}`}>{upcomingSessions.length}</span>
        </button>
      </div>

      {tab === 'active' ? (
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
                      <td className="px-5 py-3">
                        <button onClick={() => navigate(`/clients/${c.id}`)} className="flex items-center gap-2 hover:underline">
                          <Avatar name={c.name} size={28} />
                          <span className="text-brand-ink">{c.name}</span>
                        </button>
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
                      No active customers match your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="h-2" />
        </Card>
      ) : (
        <Card className="!p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-brand-muted">
                  <th className="px-5 py-3 font-medium">Customer</th>
                  <th className="px-5 py-3 font-medium">Assigned CL</th>
                  <th className="px-5 py-3 font-medium">Location</th>
                  <th className="px-5 py-3 font-medium">Date &amp; time</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredUpcoming.map((a) => {
                  const client = clients.find((c) => c.id === a.clientId);
                  const cl = clById(a.clId);
                  return (
                    <tr key={a.id} className="border-t border-black/5 hover:bg-brand-cream/60">
                      <td className="px-5 py-3">
                        {client && (
                          <button onClick={() => navigate(`/clients/${client.id}`)} className="flex items-center gap-2 hover:underline">
                            <Avatar name={client.name} size={26} />
                            <span className="text-brand-ink">{client.name}</span>
                          </button>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        {cl && (
                          <button onClick={() => navigate(`/cls/${cl.id}`)} className="flex items-center gap-2 text-brand-muted hover:underline">
                            <Avatar name={cl.name} color={cl.avatarColor} size={22} /> {cl.name}
                          </button>
                        )}
                      </td>
                      <td className="px-5 py-3 text-brand-muted">
                        <span className="flex items-center gap-1">
                          <MapPin size={12} /> {a.location}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-brand-muted">
                        <span className="flex items-center gap-1">
                          <CalendarClock size={12} /> {formatDateLabel(a.date)} · {formatTime12(a.startTime)}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <Badge status={a.status}>{a.status}</Badge>
                      </td>
                    </tr>
                  );
                })}
                {filteredUpcoming.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-5 py-6 text-center text-sm text-brand-muted">
                      No upcoming sessions match your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="h-2" />
        </Card>
      )}

      {showAdd && <AddCustomerModal onClose={() => setShowAdd(false)} onSubmit={handleAdd} />}
      <div className="h-6" />
    </PageShell>
  );
}

function AddCustomerModal({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (input: { name: string; phone: string; location: string }) => void;
}) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');

  const canSubmit = name.trim() && phone.trim() && location.trim();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-black/5 p-4">
          <p className="text-sm font-semibold text-brand-ink">Add new customer</p>
          <button onClick={onClose} className="text-brand-muted hover:text-brand-ink">
            <X size={18} />
          </button>
        </div>
        <div className="space-y-3 p-5">
          <div>
            <label className="mb-1 block text-xs font-medium text-brand-muted">Full name *</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Puan Aisyah Rahman" className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-pink" />
          </div>
          <div>
            <label className="mb-1 flex items-center gap-1 text-xs font-medium text-brand-muted">
              <Phone size={11} /> Phone number *
            </label>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+60 12-345 6789" className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-pink" />
          </div>
          <div>
            <label className="mb-1 flex items-center gap-1 text-xs font-medium text-brand-muted">
              <MapPin size={11} /> Location *
            </label>
            <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Shah Alam, Selangor" className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-pink" />
          </div>
          <p className="text-xs text-brand-muted">Email, address, due date, notes, and packages can be filled in on the customer's profile next.</p>
        </div>
        <div className="flex items-center justify-end gap-2 border-t border-black/5 p-4">
          <button onClick={onClose} className="rounded-full px-4 py-2 text-sm text-brand-muted hover:bg-brand-cream">
            Cancel
          </button>
          <button
            disabled={!canSubmit}
            onClick={() => onSubmit({ name: name.trim(), phone: phone.trim(), location: location.trim() })}
            className="rounded-full bg-brand-pink px-4 py-2 text-sm font-medium text-white disabled:opacity-30"
          >
            Add &amp; complete profile
          </button>
        </div>
      </div>
    </div>
  );
}
