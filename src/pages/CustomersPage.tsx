import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, X, MapPin, Phone, CalendarClock, CalendarHeart } from 'lucide-react';
import { PageShell } from '../components/PageShell';
import { Card, Badge, Avatar } from '../components/ui';
import { useSettings } from '../store/SettingsContext';
import { useClientStore, type NewClientInput } from '../store/ClientStore';
import { useCLStore } from '../store/CLStore';
import { useAssignmentStore } from '../store/AssignmentStore';
import { useActivityLog } from '../store/ActivityLogContext';
import { formatDateLabel, formatTime12, TODAY_STR } from '../lib/date';
import { staffPath } from '../types';

type DirectoryTab = 'active' | 'upcoming';

export default function CustomersPage() {
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

  function handleAdd(input: NewClientInput) {
    const client = addClient(input);
    logAction('Front Desk', 'Added new customer', client.name);
    setShowAdd(false);
    navigate(`/customers/${client.id}`);
  }

  return (
    <PageShell
      title="Customer directory"
      subtitle={`${clients.length} customers on file · ${activeCustomers.length} with a treatment booked`}
      searchPlaceholder="Search customers by name or area"
      onSearch={setQuery}
      headerAction={
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-1.5 rounded-full bg-brand-pink px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-pink-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink focus-visible:ring-offset-2"
        >
          <UserPlus size={16} /> Add customer
        </button>
      }
    >
      <div className="mb-6 flex flex-wrap gap-2">
        <button
          onClick={() => setTab('active')}
          className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
            tab === 'active' ? 'bg-brand-pink text-white' : 'bg-white text-brand-ink hover:bg-brand-pink-light'
          }`}
        >
          With treatments
          <span className={`rounded-full px-1.5 text-xs ${tab === 'active' ? 'bg-white/20' : 'bg-brand-cream'}`}>{activeCustomers.length}</span>
        </button>
        <button
          onClick={() => setTab('upcoming')}
          className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
            tab === 'upcoming' ? 'bg-brand-pink text-white' : 'bg-white text-brand-ink hover:bg-brand-pink-light'
          }`}
        >
          Upcoming sessions
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
                  <th className="px-5 py-3 font-medium">Area</th>
                  <th className="px-5 py-3 font-medium">Treatments</th>
                  <th className="px-5 py-3 font-medium">Preferred date</th>
                  <th className="px-5 py-3 font-medium">Bookings</th>
                  <th className="px-5 py-3 font-medium">Type</th>
                  <th className="px-5 py-3 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => {
                  const bookings = bookingCounts[c.id] ?? 0;
                  const returning = c.packageIds.length > 1 || bookings > 1;
                  return (
                    <tr key={c.id} /* taste-skill-ignore: table row */ className="border-t border-black/5 transition-colors hover:bg-brand-cream/60">
                      <td className="px-5 py-3">
                        <button onClick={() => navigate(`/customers/${c.id}`)} className="flex items-center gap-2 hover:underline">
                          <Avatar name={c.name} size={28} />
                          <span className="text-brand-ink">{c.name}</span>
                        </button>
                      </td>
                      <td className="px-5 py-3 text-brand-ink">{c.phone}</td>
                      <td className="px-5 py-3 text-brand-ink">{c.location}</td>
                      <td className="px-5 py-3">
                        <div className="flex flex-wrap gap-1">
                          {c.packageIds.map((pid) => {
                            const pkg = packageById(pid);
                            const minutes = c.packageMinutes?.[pid] ?? pkg?.tiers[0]?.minutes;
                            return (
                              <span key={pid} className="rounded-full bg-brand-pink-light px-2.5 py-1 text-xs font-medium text-brand-pink">
                                {pkg?.shortName ?? pid}
                                {minutes ? ` · ${minutes} min` : ''}
                              </span>
                            );
                          })}
                        </div>
                      </td>
                      <td className="px-5 py-3 text-brand-ink">{c.preferredDate ? formatDateLabel(c.preferredDate) : <span className="text-brand-muted">Not set</span>}</td>
                      <td className="px-5 py-3 text-brand-ink">{bookings}</td>
                      <td className="px-5 py-3">
                        <Badge status={returning ? 'completed' : 'upcoming'}>{returning ? 'Returning' : 'New'}</Badge>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <button onClick={() => navigate(`/customers/${c.id}`)} className="text-sm font-medium text-brand-pink hover:underline">
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-5 py-8 text-center text-sm text-brand-muted">
                      No customers match your search.
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
                  <th className="px-5 py-3 font-medium">Staff</th>
                  <th className="px-5 py-3 font-medium">Treatment</th>
                  <th className="px-5 py-3 font-medium">Area</th>
                  <th className="px-5 py-3 font-medium">Date &amp; time</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredUpcoming.map((a) => {
                  const client = clients.find((c) => c.id === a.clientId);
                  const cl = clById(a.clId);
                  const pkg = packageById(a.packageId);
                  return (
                    <tr key={a.id} /* taste-skill-ignore: table row */ className="border-t border-black/5 transition-colors hover:bg-brand-cream/60">
                      <td className="px-5 py-3">
                        {client && (
                          <button onClick={() => navigate(`/customers/${client.id}`)} className="flex items-center gap-2 hover:underline">
                            <Avatar name={client.name} size={26} />
                            <span className="text-brand-ink">{client.name}</span>
                          </button>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        {cl && (
                          <button onClick={() => navigate(staffPath(cl))} className="flex items-center gap-2 text-brand-ink hover:underline">
                            <Avatar name={cl.name} color={cl.avatarColor} size={22} /> {cl.name}
                          </button>
                        )}
                        {!cl && <span className="text-brand-muted">Not assigned</span>}
                      </td>
                      <td className="px-5 py-3 text-brand-ink">{pkg?.shortName ?? a.packageId}</td>
                      <td className="px-5 py-3 text-brand-ink">
                        <span className="flex items-center gap-1">
                          <MapPin size={13} className="text-brand-muted" /> {a.location}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-brand-ink">
                        <span className="flex items-center gap-1">
                          <CalendarClock size={13} className="text-brand-muted" /> {formatDateLabel(a.date)} · {formatTime12(a.startTime)}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <Badge status={a.status}>{a.status[0].toUpperCase() + a.status.slice(1)}</Badge>
                      </td>
                    </tr>
                  );
                })}
                {filteredUpcoming.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-5 py-8 text-center text-sm text-brand-muted">
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

const modalInput =
  'w-full rounded-xl bg-brand-cream px-3 py-2.5 text-sm text-brand-ink placeholder:text-brand-muted focus:outline-none focus:ring-2 focus:ring-brand-pink';
const modalLabel = 'mb-1.5 flex items-center gap-1.5 text-sm font-medium text-brand-ink';

function AddCustomerModal({ onClose, onSubmit }: { onClose: () => void; onSubmit: (input: NewClientInput) => void }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [preferredDate, setPreferredDate] = useState('');

  const canSubmit = name.trim() && phone.trim() && location.trim();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal="true" aria-labelledby="add-client-title">
      <div className="w-full max-w-sm rounded-2xl bg-white shadow-xl">{/* taste-skill-ignore: overlay */}
        <div className="flex items-center justify-between px-6 pt-6">
          <p id="add-client-title" className="text-lg font-semibold text-brand-ink">
            Add a customer
          </p>
          <button onClick={onClose} aria-label="Close" className="rounded-full p-1 text-brand-muted transition-colors hover:bg-brand-cream hover:text-brand-ink">
            <X size={18} />
          </button>
        </div>
        <div className="space-y-4 px-6 py-5">
          <div>
            <label htmlFor="new-client-name" className={modalLabel}>
              Full name
            </label>
            <input id="new-client-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Puan Aisyah Rahman" className={modalInput} />
          </div>
          <div>
            <label htmlFor="new-client-phone" className={modalLabel}>
              <Phone size={14} className="text-brand-muted" /> Phone number
            </label>
            <input id="new-client-phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="012-345 6789" className={modalInput} />
          </div>
          <div>
            <label htmlFor="new-client-area" className={modalLabel}>
              <MapPin size={14} className="text-brand-muted" /> Area
            </label>
            <input id="new-client-area" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Kajang" className={modalInput} />
          </div>
          <div>
            <label htmlFor="new-client-date" className={modalLabel}>
              <CalendarHeart size={14} className="text-brand-muted" /> Preferred date <span className="font-normal text-brand-muted">(optional)</span>
            </label>
            <input id="new-client-date" type="date" value={preferredDate} onChange={(e) => setPreferredDate(e.target.value)} className={modalInput} />
          </div>
          <p className="text-sm text-brand-muted">Email, address, notes and treatments can be added on the customer's profile next.</p>
        </div>
        <div className="flex items-center justify-end gap-2 px-6 pb-6">
          <button onClick={onClose} className="rounded-full bg-brand-cream px-4 py-2 text-sm font-medium text-brand-ink transition-colors hover:bg-brand-pink-light">
            Cancel
          </button>
          <button
            disabled={!canSubmit}
            onClick={() =>
              onSubmit({ name: name.trim(), phone: phone.trim(), location: location.trim(), preferredDate: preferredDate || undefined })
            }
            className="rounded-full bg-brand-pink px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-pink-dark disabled:opacity-30"
          >
            Add and open profile
          </button>
        </div>
      </div>
    </div>
  );
}
