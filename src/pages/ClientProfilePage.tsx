import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Phone, Mail, MapPin, Pencil, Plus, X, Info, Calendar } from 'lucide-react';
import { PageShell } from '../components/PageShell';
import { Card, Badge, Avatar, SectionTitle, formatRM } from '../components/ui';
import { useClientStore } from '../store/ClientStore';
import { useCLStore } from '../store/CLStore';
import { useSettings } from '../store/SettingsContext';
import { useActivityLog } from '../store/ActivityLogContext';
import { assignments } from '../data/assignments';
import { formatDateLabel, formatTime12 } from '../lib/date';

export default function ClientProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { clients, updateAddress, addPackageToClient, removePackageFromClient } = useClientStore();
  const { clById } = useCLStore();
  const { packages, packageById } = useSettings();
  const { logAction } = useActivityLog();

  const client = clients.find((c) => c.id === id);
  const [editingAddress, setEditingAddress] = useState(false);
  const [addressDraft, setAddressDraft] = useState(client?.address ?? '');
  const [locationDraft, setLocationDraft] = useState(client?.location ?? '');
  const [showPicker, setShowPicker] = useState(false);

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
            <Badge status={client.status}>{client.status}</Badge>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
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
                  <div key={a.id} className="flex items-center justify-between rounded-xl border border-black/5 px-3 py-2 text-sm">
                    <div>
                      <p className="font-medium text-brand-ink">{pkg?.name}</p>
                      <p className="text-xs text-brand-muted">
                        {cl?.name} · {formatDateLabel(a.date)} · {formatTime12(a.startTime)}
                      </p>
                    </div>
                    <Badge status={a.status}>{a.status}</Badge>
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
          <div className="flex flex-wrap gap-1.5">
            {client.packageIds.map((pid) => {
              const pkg = packageById(pid);
              return (
                <span key={pid} className="flex items-center gap-1 rounded-full bg-brand-pink-light px-2.5 py-1 text-xs text-brand-pink-dark">
                  {pkg?.shortName ?? pid}
                  <button
                    onClick={() => {
                      removePackageFromClient(client.id, pid);
                      logAction('Admin Amy', 'Removed package from client', `${pkg?.shortName ?? pid} from ${client.name}`);
                    }}
                    className="hover:opacity-70"
                  >
                    <X size={10} />
                  </button>
                </span>
              );
            })}
          </div>

          {showPicker ? (
            <div className="mt-3 space-y-1 rounded-lg bg-brand-cream p-2">
              {packages
                .filter((p) => !client.packageIds.includes(p.id))
                .map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      addPackageToClient(client.id, p.id);
                      logAction('Admin Amy', 'Added package to client', `${p.shortName} for ${client.name}`);
                      setShowPicker(false);
                    }}
                    className="block w-full rounded-md px-2 py-1 text-left text-xs text-brand-ink hover:bg-white"
                  >
                    {p.shortName}
                  </button>
                ))}
            </div>
          ) : (
            <button onClick={() => setShowPicker(true)} className="mt-3 flex items-center gap-1 text-xs font-medium text-brand-pink hover:underline">
              <Plus size={12} /> Add package
            </button>
          )}
        </Card>
      </div>
      <div className="h-6" />
    </PageShell>
  );
}
