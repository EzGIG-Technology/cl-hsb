import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Phone, Mail, MapPin, Pencil, Plus, X, Info, CalendarHeart, UserX, AlertTriangle, Receipt } from 'lucide-react';
import { PageShell } from '../components/PageShell';
import { PackageArt } from '../components/PackageArt';
import { Card, Badge, Avatar, SectionTitle, formatRM } from '../components/ui';
import { useClientStore } from '../store/ClientStore';
import { useCLStore } from '../store/CLStore';
import { useSettings } from '../store/SettingsContext';
import { useActivityLog } from '../store/ActivityLogContext';
import { useAssignmentStore } from '../store/AssignmentStore';
import { formatDateLabel, formatTime12 } from '../lib/date';
import { monthlySpendForClient } from '../lib/clientMetrics';
import { staffPath, type Client } from '../types';

const paymentStatusBadge: Record<string, 'completed' | 'pending' | 'confirmed'> = {
  released: 'completed',
  'in-review': 'pending',
  pending: 'pending',
};

const inputClass =
  'w-full rounded-xl bg-brand-cream px-3 py-2.5 text-sm text-brand-ink placeholder:text-brand-muted focus:outline-none focus:ring-2 focus:ring-brand-pink';
const labelClass = 'mb-1.5 block text-sm font-medium text-brand-ink';

function capitalise(s: string) {
  return s ? s[0].toUpperCase() + s.slice(1) : s;
}

/** Length of a booked session in minutes, from its start and end times. */
function sessionMinutes(start: string, end: string) {
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  const mins = eh * 60 + em - (sh * 60 + sm);
  return mins > 0 ? mins : null;
}

export default function CustomerProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { clients, updateAddress, addPackageToClient, removePackageFromClient, updatePackageMinutes } = useClientStore();
  const { clById } = useCLStore();
  const { packages, packageById, locationCapacity } = useSettings();
  const { logAction } = useActivityLog();
  const { assignments, unassignedClientIds } = useAssignmentStore();

  const client = clients.find((c) => c.id === id);
  const [editingAddress, setEditingAddress] = useState(false);
  const [addressDraft, setAddressDraft] = useState(client?.address ?? '');
  const [locationDraft, setLocationDraft] = useState(client?.location ?? '');
  const [showPicker, setShowPicker] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);

  if (!client) {
    return (
      <PageShell title="Customer not found">
        <Link to="/customers" className="text-brand-pink underline">
          Back to customers
        </Link>
      </PageShell>
    );
  }

  /** Price of the session length this customer picked for a treatment (falls back to the shortest). */
  function priceFor(pid: string) {
    const pkg = packageById(pid);
    if (!pkg) return 0;
    const minutes = client!.packageMinutes?.[pid];
    return (pkg.tiers.find((t) => t.minutes === minutes) ?? pkg.tiers[0])?.price ?? 0;
  }

  const bookings = assignments.filter((a) => a.clientId === client.id).sort((a, b) => b.date.localeCompare(a.date));
  const total = client.packageIds.reduce((sum, pid) => sum + priceFor(pid), 0);
  const returning = client.packageIds.length > 1 || bookings.length > 1;
  const sessionsPlanned = bookings.filter((a) => a.status !== 'cancelled').length;
  const sessionsCompleted = bookings.filter((a) => a.status === 'completed').length;
  const monthlySpend = monthlySpendForClient(client, bookings, packageById);
  const needsAssignment = unassignedClientIds.includes(client.id);
  const pendingConfirmation = bookings.filter((a) => a.status === 'pending');
  const billableBookings = bookings.filter((a) => a.status === 'completed' || a.status === 'confirmed');
  const areaOptions = locationCapacity.map((l) => l.location);

  function saveAddress() {
    updateAddress(client!.id, addressDraft.trim(), locationDraft.trim());
    logAction('Front Desk', 'Updated customer address', `${client!.name} → ${locationDraft.trim()}`);
    setEditingAddress(false);
  }

  const figures = [
    { label: 'Sessions booked', value: sessionsPlanned },
    { label: 'Completed', value: sessionsCompleted },
    { label: 'Treatments', value: client.packageIds.length },
    { label: 'Spend this month', value: formatRM(monthlySpend.find((m) => m.isCurrent)?.spent ?? 0) },
  ];

  return (
    <PageShell title={client.name} subtitle={client.location}>
      <button onClick={() => navigate('/customers')} className="mb-6 flex items-center gap-2 text-sm text-brand-muted transition-colors hover:text-brand-ink">
        <ArrowLeft size={15} /> Back to customers
      </button>

      {(needsAssignment || pendingConfirmation.length > 0) && (
        <div className="mb-6 space-y-2">
          {needsAssignment && (
            <Link to="/bookings" className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 transition-colors hover:bg-red-100">
              <UserX size={16} className="shrink-0" /> This customer has a booking with no staff assigned yet. Assign one in Bookings.
            </Link>
          )}
          {pendingConfirmation.length > 0 && (
            <div className="flex items-center gap-2 rounded-xl bg-brand-amber-light px-4 py-3 text-sm text-brand-ink">
              <AlertTriangle size={16} className="shrink-0 text-brand-amber" />
              {pendingConfirmation.length} upcoming session{pendingConfirmation.length === 1 ? ' is' : 's are'} waiting for confirmation. See booking history below.
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card className="p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <Avatar name={client.name} size={56} />
                <div>
                  <p className="text-lg font-semibold text-brand-ink">{client.name}</p>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    <Badge status={returning ? 'completed' : 'upcoming'}>{returning ? 'Returning customer' : 'New customer'}</Badge>
                    <Badge status={client.status}>{capitalise(client.status)}</Badge>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setEditingProfile(true)}
                className="flex items-center gap-1.5 rounded-full bg-brand-pink-light px-4 py-2 text-sm font-medium text-brand-pink transition-colors hover:bg-brand-pink hover:text-white"
              >
                <Pencil size={14} /> Edit profile
              </button>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {figures.map((f) => (
                <div key={f.label} className="rounded-xl bg-brand-cream p-4">
                  <p className="text-sm text-brand-muted">{f.label}</p>
                  <p className="mt-1 text-3xl font-semibold tracking-tight text-brand-ink">{f.value}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 grid grid-cols-1 gap-5 text-sm sm:grid-cols-3">
              <div>
                <p className="mb-1 flex items-center gap-1.5 text-sm text-brand-muted">
                  <Phone size={14} /> Phone
                </p>
                <p className="text-brand-ink">{client.phone || 'Not set'}</p>
              </div>
              <div className="min-w-0">
                <p className="mb-1 flex items-center gap-1.5 text-sm text-brand-muted">
                  <Mail size={14} /> Email
                </p>
                <p className="truncate text-brand-ink">{client.email || 'Not set'}</p>
              </div>
              <div>
                <p className="mb-1 flex items-center gap-1.5 text-sm text-brand-muted">
                  <CalendarHeart size={14} /> Preferred date
                </p>
                <p className="text-brand-ink">{client.preferredDate ? formatDateLabel(client.preferredDate) : 'Not set'}</p>
              </div>
            </div>

            <div className="mt-5">
              <p className="mb-1 flex items-center gap-1.5 text-sm text-brand-muted">
                <MapPin size={14} /> Address
              </p>
              {editingAddress ? (
                <div className="mt-2 space-y-3 rounded-xl bg-brand-cream p-4">
                  <div>
                    <label htmlFor="client-address" className={labelClass}>
                      Street address
                    </label>
                    <input
                      id="client-address"
                      value={addressDraft}
                      onChange={(e) => setAddressDraft(e.target.value)}
                      className={inputClass.replace('bg-brand-cream', 'bg-white')}
                    />
                  </div>
                  <div>
                    <label htmlFor="client-area" className={labelClass}>
                      Area
                    </label>
                    <input
                      id="client-area"
                      list="client-area-options"
                      value={locationDraft}
                      onChange={(e) => setLocationDraft(e.target.value)}
                      className={inputClass.replace('bg-brand-cream', 'bg-white')}
                    />
                    <datalist id="client-area-options">
                      {areaOptions.map((a) => (
                        <option key={a} value={a} />
                      ))}
                    </datalist>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={saveAddress}
                      className="rounded-full bg-brand-pink px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-pink-dark"
                    >
                      Save address
                    </button>
                    <button
                      onClick={() => {
                        setAddressDraft(client.address);
                        setLocationDraft(client.location);
                        setEditingAddress(false);
                      }}
                      className="rounded-full bg-white px-4 py-2 text-sm font-medium text-brand-ink transition-colors hover:bg-brand-pink-light"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setAddressDraft(client.address);
                    setLocationDraft(client.location);
                    setEditingAddress(true);
                  }}
                  className="group flex items-center gap-2 text-left text-sm text-brand-ink"
                  aria-label="Edit address"
                >
                  <span>
                    {client.address || 'No address yet'}
                    {client.location && <span className="text-brand-muted"> · {client.location}</span>}
                  </span>
                  <Pencil size={13} className="shrink-0 text-brand-muted transition-colors group-hover:text-brand-pink" />
                </button>
              )}
            </div>

            {client.notes && (
              <p className="mt-5 flex items-start gap-2 rounded-xl bg-brand-cream p-4 text-sm text-brand-ink">
                <Info size={15} className="mt-0.5 shrink-0 text-brand-muted" /> {client.notes}
              </p>
            )}
          </Card>

          <Card className="p-6">
            <SectionTitle>Booking history</SectionTitle>
            <div className="space-y-2">
              {bookings.length === 0 && <p className="text-sm text-brand-muted">No bookings yet.</p>}
              {bookings.map((a) => {
                const cl = clById(a.clId);
                const pkg = packageById(a.packageId);
                const mins = sessionMinutes(a.startTime, a.endTime);
                return (
                  <div key={a.id} className="flex items-center gap-3 rounded-xl bg-brand-cream px-4 py-3 text-sm">
                    {pkg && <PackageArt pkg={pkg} size={40} rounded="rounded-xl" />}
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-brand-ink">
                        {pkg?.name ?? a.packageId}
                        {mins && <span className="font-normal text-brand-muted"> · {mins} min</span>}
                      </p>
                      <p className="text-sm text-brand-muted">
                        {formatDateLabel(a.date)}, {formatTime12(a.startTime)} · {a.location}
                        {cl ? (
                          <>
                            {' · '}
                            <Link to={staffPath(cl)} className="text-brand-ink hover:underline">
                              {cl.name}
                            </Link>
                          </>
                        ) : (
                          ' · No staff assigned yet'
                        )}
                      </p>
                    </div>
                    <Badge status={a.status}>{capitalise(a.status)}</Badge>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card className="p-6">
            <SectionTitle>Payment history</SectionTitle>
            <div className="space-y-2">
              {billableBookings.length === 0 && <p className="text-sm text-brand-muted">No billable sessions yet.</p>}
              {billableBookings.map((a) => {
                const pkg = packageById(a.packageId);
                const amount = priceFor(a.packageId);
                const status = a.paymentStatus ?? (a.status === 'completed' ? 'released' : 'pending');
                return (
                  <div key={a.id} className="flex items-center justify-between gap-3 rounded-xl bg-brand-cream px-4 py-3 text-sm">
                    <div className="flex items-center gap-3">
                      <Receipt size={16} className="shrink-0 text-brand-muted" />
                      <div>
                        <p className="font-medium text-brand-ink">
                          {pkg?.shortName ?? a.packageId} · {formatRM(amount)}
                        </p>
                        <p className="text-sm text-brand-muted">{formatDateLabel(a.date)}</p>
                      </div>
                    </div>
                    <Badge status={paymentStatusBadge[status] ?? 'pending'}>
                      {status === 'released' ? 'Paid' : status === 'in-review' ? 'In review' : 'Pending'}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        <Card className="h-fit p-6">
          <SectionTitle action={<span className="text-sm text-brand-muted">{formatRM(total)} total</span>}>Treatments</SectionTitle>
          <div className="space-y-2">
            {client.packageIds.map((pid) => {
              const pkg = packageById(pid);
              if (!pkg) return null;
              const selectedMinutes = client.packageMinutes?.[pid] ?? pkg.tiers[0]?.minutes;
              return (
                <div key={pid} className="flex items-center gap-3 rounded-xl bg-brand-cream p-3">
                  <PackageArt pkg={pkg} size={40} rounded="rounded-xl" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-brand-ink">{pkg.shortName}</p>
                    {pkg.tiers.length > 0 ? (
                      <select
                        aria-label={`Session length for ${pkg.shortName}`}
                        value={selectedMinutes}
                        onChange={(e) => {
                          const minutes = Number(e.target.value);
                          updatePackageMinutes(client.id, pid, minutes);
                          logAction('Front Desk', 'Updated session length', `${pkg.shortName} → ${minutes} min for ${client.name}`);
                        }}
                        className="mt-1 w-full rounded-lg bg-white px-2 py-1 text-sm text-brand-ink focus:outline-none focus:ring-2 focus:ring-brand-pink"
                      >
                        {pkg.tiers.map((t) => (
                          <option key={t.minutes} value={t.minutes}>
                            {t.minutes} min · {formatRM(t.price)}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <p className="text-sm text-brand-muted">No price set</p>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      removePackageFromClient(client.id, pid);
                      logAction('Front Desk', 'Removed treatment from customer', `${pkg.shortName} from ${client.name}`);
                    }}
                    aria-label={`Remove ${pkg.shortName}`}
                    className="shrink-0 rounded-full p-1 text-brand-muted transition-colors hover:bg-white hover:text-red-600"
                  >
                    <X size={15} />
                  </button>
                </div>
              );
            })}
            {client.packageIds.length === 0 && <p className="text-sm text-brand-muted">No treatments chosen yet.</p>}
          </div>

          {showPicker ? (
            <div className="mt-4 space-y-1 rounded-xl bg-brand-cream p-2">
              <div className="flex items-center justify-between px-2 py-1">
                <p className="text-sm font-medium text-brand-ink">Choose a treatment</p>
                <button onClick={() => setShowPicker(false)} aria-label="Close" className="text-brand-muted hover:text-brand-ink">
                  <X size={14} />
                </button>
              </div>
              {packages
                .filter((p) => !client.packageIds.includes(p.id))
                .map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      addPackageToClient(client.id, p.id, p.tiers[0]?.minutes);
                      logAction('Front Desk', 'Added treatment to customer', `${p.shortName} for ${client.name}`);
                      setShowPicker(false);
                    }}
                    className="flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left text-sm text-brand-ink transition-colors hover:bg-white"
                  >
                    <PackageArt pkg={p} size={28} rounded="rounded-lg" />
                    <span className="flex-1">{p.shortName}</span>
                    {p.tiers[0] && <span className="text-brand-muted">from {formatRM(p.tiers[0].price)}</span>}
                  </button>
                ))}
            </div>
          ) : (
            <button
              onClick={() => setShowPicker(true)}
              className="mt-4 flex items-center gap-1.5 rounded-full bg-brand-pink-light px-4 py-2 text-sm font-medium text-brand-pink transition-colors hover:bg-brand-pink hover:text-white"
            >
              <Plus size={14} /> Add treatment
            </button>
          )}
        </Card>
      </div>
      {editingProfile && <EditCustomerModal client={client} onClose={() => setEditingProfile(false)} />}
      <div className="h-6" />
    </PageShell>
  );
}

function EditCustomerModal({ client, onClose }: { client: Client; onClose: () => void }) {
  const { updateDetails } = useClientStore();
  const { logAction } = useActivityLog();
  const [phone, setPhone] = useState(client.phone);
  const [email, setEmail] = useState(client.email);
  const [preferredDate, setPreferredDate] = useState(client.preferredDate);
  const [notes, setNotes] = useState(client.notes ?? '');
  const [status, setStatus] = useState<Client['status']>(client.status);

  function save() {
    updateDetails(client.id, { phone: phone.trim(), email: email.trim(), preferredDate, notes: notes.trim() || undefined, status });
    logAction('Front Desk', 'Edited customer profile', client.name);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal="true" aria-labelledby="edit-client-title">
      <div className="w-full max-w-sm rounded-2xl bg-white shadow-xl">{/* taste-skill-ignore: overlay */}
        <div className="flex items-center justify-between px-6 pt-6">
          <p id="edit-client-title" className="text-lg font-semibold text-brand-ink">
            Edit {client.name}
          </p>
          <button onClick={onClose} aria-label="Close" className="rounded-full p-1 text-brand-muted transition-colors hover:bg-brand-cream hover:text-brand-ink">
            <X size={18} />
          </button>
        </div>
        <div className="space-y-4 px-6 py-5">
          <div>
            <label htmlFor="edit-phone" className={labelClass}>
              Phone
            </label>
            <input id="edit-phone" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label htmlFor="edit-email" className={labelClass}>
              Email
            </label>
            <input id="edit-email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label htmlFor="edit-date" className={labelClass}>
              Preferred date
            </label>
            <input id="edit-date" type="date" value={preferredDate} onChange={(e) => setPreferredDate(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label htmlFor="edit-status" className={labelClass}>
              Status
            </label>
            <select id="edit-status" value={status} onChange={(e) => setStatus(e.target.value as Client['status'])} className={inputClass}>
              <option value="upcoming">Upcoming</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div>
            <label htmlFor="edit-notes" className={labelClass}>
              Notes
            </label>
            <textarea id="edit-notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className={inputClass} />
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 px-6 pb-6">
          <button onClick={onClose} className="rounded-full bg-brand-cream px-4 py-2 text-sm font-medium text-brand-ink transition-colors hover:bg-brand-pink-light">
            Cancel
          </button>
          <button onClick={save} className="rounded-full bg-brand-pink px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-pink-dark">
            Save changes
          </button>
        </div>
      </div>
    </div>
  );
}
