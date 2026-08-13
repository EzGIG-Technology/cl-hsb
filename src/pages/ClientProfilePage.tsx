import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  Pencil,
  Plus,
  X,
  Info,
  Calendar,
  Hash,
  CheckCircle2,
  Package as PackageIcon,
  Wallet,
  UserX,
  AlertTriangle,
  Receipt,
} from 'lucide-react';
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
import type { Client } from '../types';

const paymentStatusBadge: Record<string, 'completed' | 'pending' | 'confirmed'> = {
  released: 'completed',
  'in-review': 'pending',
  pending: 'pending',
};

export default function ClientProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { clients, updateAddress, addPackageToClient, removePackageFromClient, updatePackageDays } = useClientStore();
  const { clById } = useCLStore();
  const { packages, packageById } = useSettings();
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
        <Link to="/clients" className="text-brand-pink underline">
          Back to Customer Directory
        </Link>
      </PageShell>
    );
  }

  const bookings = assignments.filter((a) => a.clientId === client.id).sort((a, b) => b.date.localeCompare(a.date));
  const total = client.packageIds.reduce((sum, pid) => {
    const pkg = packageById(pid);
    if (!pkg) return sum;
    return sum + (pkg.sessionPrice?.perSession ?? pkg.tiers[0]?.price ?? 0);
  }, 0);
  const returning = client.packageIds.length > 1 || bookings.length > 1;
  const sessionsPlanned = bookings.filter((a) => a.status !== 'cancelled').length;
  const sessionsCompleted = bookings.filter((a) => a.status === 'completed').length;
  const monthlySpend = monthlySpendForClient(client, bookings, packageById);
  const needsAssignment = unassignedClientIds.includes(client.id);
  const pendingConfirmation = bookings.filter((a) => a.status === 'pending');
  const billableBookings = bookings.filter((a) => a.status === 'completed' || a.status === 'confirmed');

  function saveAddress() {
    updateAddress(client!.id, addressDraft, locationDraft);
    logAction('Admin Amy', 'Updated client address', `${client!.name} → ${locationDraft}`);
    setEditingAddress(false);
  }

  return (
    <PageShell title={client.name} subtitle={client.location}>
      <button onClick={() => navigate('/clients')} className="mb-4 flex items-center gap-2 text-sm text-brand-muted hover:text-brand-ink">
        <ArrowLeft size={15} /> Back to Customer Directory
      </button>

      {needsAssignment && (
        <Link
          to="/bookings"
          className="mb-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700 hover:bg-red-100"
        >
          <UserX size={15} className="shrink-0" /> This customer has a booking with no caregiver assigned yet — assign a CL in Bookings & Assignment.
        </Link>
      )}
      {pendingConfirmation.length > 0 && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-brand-amber/30 bg-brand-amber-light px-4 py-2.5 text-sm text-brand-amber">
          <AlertTriangle size={15} className="shrink-0" />
          {pendingConfirmation.length} upcoming session{pendingConfirmation.length === 1 ? '' : 's'} awaiting confirmation — see Upcoming below.
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Avatar name={client.name} size={52} />
              <div>
                <p className="text-lg font-semibold text-brand-ink">{client.name}</p>
                <Badge status={returning ? 'completed' : 'upcoming'}>{returning ? 'Returning Customer' : 'New Customer'}</Badge>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge status={client.status}>{client.status}</Badge>
              <button
                onClick={() => setEditingProfile(true)}
                className="flex items-center gap-1.5 rounded-full border border-black/10 px-3 py-1.5 text-xs font-medium text-brand-ink hover:bg-brand-cream"
              >
                <Pencil size={13} /> Edit Profile
              </button>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 border-t border-black/5 pt-4 sm:grid-cols-4">
            <div>
              <p className="flex items-center gap-1 text-[10px] text-brand-muted">
                <Hash size={12} /> Sessions Planned
              </p>
              <p className="mt-0.5 text-sm font-semibold text-brand-ink">{sessionsPlanned}</p>
            </div>
            <div>
              <p className="flex items-center gap-1 text-[10px] text-brand-muted">
                <CheckCircle2 size={12} /> Completed Sessions
              </p>
              <p className="mt-0.5 text-sm font-semibold text-brand-ink">{sessionsCompleted}</p>
            </div>
            <div>
              <p className="flex items-center gap-1 text-[10px] text-brand-muted">
                <PackageIcon size={12} /> Active Packages
              </p>
              <p className="mt-0.5 text-sm font-semibold text-brand-ink">{client.packageIds.length}</p>
            </div>
            <div>
              <p className="flex items-center gap-1 text-[10px] text-brand-muted">
                <Wallet size={12} /> Aug 2026 Spend
              </p>
              <p className="mt-0.5 text-sm font-semibold text-brand-ink">{formatRM(monthlySpend.find((m) => m.isCurrent)?.spent ?? 0)}</p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-3 border-t border-black/5 pt-4 text-sm sm:grid-cols-2">
            <div>
              <p className="mb-1 flex items-center gap-1.5 text-xs text-brand-muted">
                <Phone size={14} /> Phone
              </p>
              <p className="text-brand-ink">{client.phone}</p>
            </div>
            <div>
              <p className="mb-1 flex items-center gap-1.5 text-xs text-brand-muted">
                <Mail size={14} /> Email
              </p>
              <p className="text-brand-ink">{client.email}</p>
            </div>
            <div>
              <p className="mb-1 flex items-center gap-1.5 text-xs text-brand-muted">
                <Calendar size={14} /> Due / birth date
              </p>
              <p className="text-brand-ink">{formatDateLabel(client.dueOrBirthDate)}</p>
            </div>
            <div className="sm:col-span-2">
              <p className="mb-1 flex items-center gap-1.5 text-xs text-brand-muted">
                <MapPin size={14} /> Address
              </p>
              {editingAddress ? (
                <div className="space-y-2">
                  <input
                    value={addressDraft}
                    onChange={(e) => setAddressDraft(e.target.value)}
                    className="w-full rounded-md border border-black/10 px-2 py-1.5 text-sm"
                  />
                  <input
                    value={locationDraft}
                    onChange={(e) => setLocationDraft(e.target.value)}
                    className="w-full rounded-md border border-black/10 px-2 py-1.5 text-sm"
                  />
                  <div className="flex gap-2">
                    <button onClick={saveAddress} className="rounded-full bg-brand-pink px-3 py-1 text-xs font-medium text-white">
                      Save
                    </button>
                    <button onClick={() => setEditingAddress(false)} className="rounded-full px-3 py-1 text-xs text-brand-muted hover:bg-brand-cream">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button onClick={() => setEditingAddress(true)} className="flex items-center gap-2 text-left text-brand-ink hover:opacity-80">
                  {client.address}
                  <Pencil size={12} className="shrink-0 text-brand-muted" />
                </button>
              )}
            </div>
          </div>

          {client.notes && (
            <p className="mt-4 flex items-start gap-2 rounded-lg bg-brand-cream p-3 text-xs text-brand-muted">
              <Info size={14} className="mt-0.5 shrink-0" /> {client.notes}
            </p>
          )}

          <div className="mt-5 border-t border-black/5 pt-4">
            <SectionTitle>Booking history</SectionTitle>
            <div className="space-y-2">
              {bookings.length === 0 && <p className="text-sm text-brand-muted">No bookings yet.</p>}
              {bookings.map((a) => {
                const cl = clById(a.clId);
                const pkg = packageById(a.packageId);
                return (
                  <div key={a.id} className="flex items-center gap-3 rounded-xl border border-black/5 px-3 py-2 text-sm">
                    {pkg && <PackageArt pkg={pkg} size={36} rounded="rounded-lg" />}
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-brand-ink">{pkg?.name}</p>
                      <p className="text-xs text-brand-muted">
                        {cl && (
                          <Link to={`/cls/${cl.id}`} className="hover:underline">
                            {cl.name}
                          </Link>
                        )}{' '}
                        · {formatDateLabel(a.date)} · {formatTime12(a.startTime)}
                      </p>
                    </div>
                    <Badge status={a.status}>{a.status}</Badge>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-5 border-t border-black/5 pt-4">
            <SectionTitle>Payment history</SectionTitle>
            <div className="space-y-2">
              {billableBookings.length === 0 && <p className="text-sm text-brand-muted">No billable sessions yet.</p>}
              {billableBookings.map((a) => {
                const pkg = packageById(a.packageId);
                const amount = pkg?.tiers[0]?.price ?? pkg?.sessionPrice?.perSession ?? 0;
                const status = a.paymentStatus ?? (a.status === 'completed' ? 'released' : 'pending');
                return (
                  <div key={a.id} className="flex items-center justify-between rounded-xl border border-black/5 px-3 py-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Receipt size={14} className="shrink-0 text-brand-muted" />
                      <div>
                        <p className="font-medium text-brand-ink">{pkg?.shortName} — {formatRM(amount)}</p>
                        <p className="text-xs text-brand-muted">{formatDateLabel(a.date)}</p>
                      </div>
                    </div>
                    <Badge status={paymentStatusBadge[status] ?? 'pending'}>
                      {status === 'released' ? 'Paid' : status === 'in-review' ? 'In review' : 'Pending'}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>

        <Card className="h-fit">
          <div className="mb-2 flex items-center justify-between">
            <SectionTitle>Packages</SectionTitle>
            <span className="text-xs text-brand-muted">from {formatRM(total)}</span>
          </div>
          <div className="space-y-2">
            {client.packageIds.map((pid) => {
              const pkg = packageById(pid);
              if (!pkg) return null;
              const selectedDays = client.packageDays?.[pid] ?? pkg.tiers[0]?.days;
              const tier = pkg.tiers.find((t) => t.days === selectedDays) ?? pkg.tiers[0];
              const price = tier?.price ?? pkg.sessionPrice?.perSession ?? 0;
              return (
                <div key={pid} className="flex items-center gap-2.5 rounded-xl border border-black/5 p-2.5">
                  <PackageArt pkg={pkg} size={36} rounded="rounded-lg" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-brand-ink">{pkg.shortName}</p>
                    {pkg.tiers.length > 0 ? (
                      <select
                        value={selectedDays}
                        onChange={(e) => {
                          const days = Number(e.target.value);
                          updatePackageDays(client.id, pid, days);
                          logAction('Admin Amy', 'Updated package duration', `${pkg.shortName} → ${days} days for ${client.name}`);
                        }}
                        className="mt-0.5 rounded-md border border-black/10 bg-white px-1.5 py-0.5 text-[11px] text-brand-ink"
                      >
                        {pkg.tiers.map((t) => (
                          <option key={t.days} value={t.days}>
                            {t.days} days · {formatRM(t.price)}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <p className="text-xs text-brand-muted">Per session · {formatRM(price)}</p>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      removePackageFromClient(client.id, pid);
                      logAction('Admin Amy', 'Removed package from client', `${pkg.shortName} from ${client.name}`);
                    }}
                    className="shrink-0 text-brand-muted hover:text-red-500"
                  >
                    <X size={14} />
                  </button>
                </div>
              );
            })}
            {client.packageIds.length === 0 && <p className="text-sm text-brand-muted">No packages selected yet.</p>}
          </div>

          {showPicker ? (
            <div className="mt-3 space-y-1 rounded-lg bg-brand-cream p-2">
              {packages
                .filter((p) => !client.packageIds.includes(p.id))
                .map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      addPackageToClient(client.id, p.id, p.tiers[0]?.days);
                      logAction('Admin Amy', 'Added package to client', `${p.shortName} for ${client.name}`);
                      setShowPicker(false);
                    }}
                    className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs text-brand-ink hover:bg-white"
                  >
                    <PackageArt pkg={p} size={24} rounded="rounded-md" />
                    {p.shortName}
                  </button>
                ))}
            </div>
          ) : (
            <button onClick={() => setShowPicker(true)} className="mt-3 flex items-center gap-1 text-xs font-medium text-brand-pink hover:underline">
              <Plus size={12} /> Add-on package
            </button>
          )}
        </Card>
      </div>
      {editingProfile && <EditClientModal client={client} onClose={() => setEditingProfile(false)} />}
      <div className="h-6" />
    </PageShell>
  );
}

function EditClientModal({ client, onClose }: { client: Client; onClose: () => void }) {
  const { updateDetails } = useClientStore();
  const { logAction } = useActivityLog();
  const [phone, setPhone] = useState(client.phone);
  const [email, setEmail] = useState(client.email);
  const [dueOrBirthDate, setDueOrBirthDate] = useState(client.dueOrBirthDate);
  const [notes, setNotes] = useState(client.notes ?? '');
  const [status, setStatus] = useState<Client['status']>(client.status);

  function save() {
    updateDetails(client.id, { phone: phone.trim(), email: email.trim(), dueOrBirthDate, notes: notes.trim() || undefined, status });
    logAction('Admin Amy', 'Edited client profile', client.name);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-black/5 p-4">
          <p className="text-sm font-semibold text-brand-ink">Edit profile — {client.name}</p>
          <button onClick={onClose} className="text-brand-muted hover:text-brand-ink">
            <X size={18} />
          </button>
        </div>
        <div className="space-y-3 p-5">
          <div>
            <label className="mb-1 block text-xs font-medium text-brand-muted">Phone</label>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-pink" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-brand-muted">Email</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-pink" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-brand-muted">Due / birth date</label>
            <input type="date" value={dueOrBirthDate} onChange={(e) => setDueOrBirthDate(e.target.value)} className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-pink" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-brand-muted">Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value as Client['status'])} className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-pink">
              <option value="upcoming">Upcoming</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-brand-muted">Notes</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-pink" />
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 border-t border-black/5 p-4">
          <button onClick={onClose} className="rounded-full px-4 py-2 text-sm text-brand-muted hover:bg-brand-cream">
            Cancel
          </button>
          <button onClick={save} className="rounded-full bg-brand-pink px-4 py-2 text-sm font-medium text-white hover:bg-brand-pink-dark">
            Save changes
          </button>
        </div>
      </div>
    </div>
  );
}
