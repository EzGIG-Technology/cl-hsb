import { useMemo, useState } from 'react';
import { PlusCircle, X, ChevronRight, ChevronLeft, Star, Sparkles, Check } from 'lucide-react';
import { PageShell } from '../components/PageShell';
import { Card, Badge, Avatar, formatRM } from '../components/ui';
import { useAssignmentStore } from '../store/AssignmentStore';
import { useClientStore } from '../store/ClientStore';
import { useCLStore } from '../store/CLStore';
import { useSettings } from '../store/SettingsContext';
import { useActivityLog } from '../store/ActivityLogContext';
import { formatDateLabel, formatTime12, TODAY, toDateStr } from '../lib/date';

type Tab = 'unassigned' | 'active' | 'completed' | 'cancelled';

export default function BookingsPage() {
  const { assignments, unassignedClientIds } = useAssignmentStore();
  const { clients } = useClientStore();
  const { cls } = useCLStore();
  const { packageById } = useSettings();
  const [tab, setTab] = useState<Tab>('unassigned');
  const [areaFilter, setAreaFilter] = useState('all');
  const [wizardOpen, setWizardOpen] = useState(false);

  const areas = useMemo(() => Array.from(new Set(clients.map((c) => c.location))).sort(), [clients]);

  const activeRows = assignments.filter((a) => a.status === 'confirmed' || a.status === 'pending');
  const completedRows = assignments.filter((a) => a.status === 'completed');
  const cancelledRows = assignments.filter((a) => a.status === 'cancelled');
  const unassignedRows = unassignedClientIds.map((id) => clients.find((c) => c.id === id)).filter(Boolean) as typeof clients;

  const filteredUnassigned = areaFilter === 'all' ? unassignedRows : unassignedRows.filter((c) => c.location === areaFilter);
  const filteredActive = areaFilter === 'all' ? activeRows : activeRows.filter((a) => a.location.includes(areaFilter.split(',')[0]));
  const filteredCompleted = areaFilter === 'all' ? completedRows : completedRows.filter((a) => a.location.includes(areaFilter.split(',')[0]));
  const filteredCancelled = areaFilter === 'all' ? cancelledRows : cancelledRows.filter((a) => a.location.includes(areaFilter.split(',')[0]));

  const tabs: { id: Tab; label: string; count: number }[] = [
    { id: 'unassigned', label: 'Unassigned', count: filteredUnassigned.length },
    { id: 'active', label: 'Active', count: filteredActive.length },
    { id: 'completed', label: 'Completed', count: filteredCompleted.length },
    { id: 'cancelled', label: 'Cancelled', count: filteredCancelled.length },
  ];

  return (
    <PageShell
      title="Bookings & Assignment"
      subtitle="Manage every booking from request to payroll."
      headerAction={
        <button
          onClick={() => setWizardOpen(true)}
          className="flex items-center gap-1.5 rounded-full bg-brand-pink px-4 py-2 text-sm font-medium text-white hover:bg-brand-pink-dark"
        >
          <PlusCircle size={15} /> New Booking
        </button>
      }
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                tab === t.id ? 'bg-brand-pink text-white' : 'border border-black/10 bg-white text-brand-ink hover:bg-brand-cream'
              }`}
            >
              {t.label}
              <span className={`rounded-full px-1.5 text-xs ${tab === t.id ? 'bg-white/20' : 'bg-brand-cream'}`}>{t.count}</span>
            </button>
          ))}
        </div>
        <select value={areaFilter} onChange={(e) => setAreaFilter(e.target.value)} className="rounded-full border border-black/10 bg-white px-3 py-2 text-sm text-brand-ink">
          <option value="all">All areas</option>
          {areas.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
      </div>

      {tab === 'unassigned' && (
        <Card className="!p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-brand-muted">
                  <th className="px-5 py-3 font-medium">Customer</th>
                  <th className="px-5 py-3 font-medium">Package</th>
                  <th className="px-5 py-3 font-medium">Area</th>
                  <th className="px-5 py-3 font-medium">Due date</th>
                  <th className="px-5 py-3 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {filteredUnassigned.map((c) => (
                  <tr key={c.id} className="border-t border-black/5">
                    <td className="flex items-center gap-2 px-5 py-3">
                      <Avatar name={c.name} size={26} />
                      {c.name}
                    </td>
                    <td className="px-5 py-3 text-brand-muted">{packageById(c.packageIds[0])?.shortName}</td>
                    <td className="px-5 py-3 text-brand-muted">{c.location}</td>
                    <td className="px-5 py-3 text-brand-muted">{formatDateLabel(c.dueOrBirthDate)}</td>
                    <td className="px-5 py-3 text-right">
                      <button onClick={() => setWizardOpen(true)} className="text-xs font-medium text-brand-pink hover:underline">
                        Assign
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredUnassigned.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-5 py-6 text-center text-sm text-brand-muted">
                      No unassigned bookings.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="h-2" />
        </Card>
      )}

      {(tab === 'active' || tab === 'completed' || tab === 'cancelled') && (
        <Card className="!p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-brand-muted">
                  <th className="px-5 py-3 font-medium">Booking</th>
                  <th className="px-5 py-3 font-medium">Customer</th>
                  <th className="px-5 py-3 font-medium">Caregiver</th>
                  <th className="px-5 py-3 font-medium">Package</th>
                  <th className="px-5 py-3 font-medium">Date</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {(tab === 'active' ? filteredActive : tab === 'completed' ? filteredCompleted : filteredCancelled).map((a) => {
                  const client = clients.find((c) => c.id === a.clientId);
                  const cl = cls.find((c) => c.id === a.clId);
                  const pkg = packageById(a.packageId);
                  return (
                    <tr key={a.id} className="border-t border-black/5">
                      <td className="px-5 py-3 font-mono text-xs text-brand-muted">#{a.id.toUpperCase()}</td>
                      <td className="px-5 py-3 text-brand-ink">{client?.name}</td>
                      <td className="flex items-center gap-2 px-5 py-3">
                        {cl && <Avatar name={cl.name} color={cl.avatarColor} size={24} />}
                        <span className="text-brand-muted">{cl?.name}</span>
                      </td>
                      <td className="px-5 py-3 text-brand-muted">{pkg?.shortName}</td>
                      <td className="px-5 py-3 text-brand-muted">
                        {formatDateLabel(a.date)} · {formatTime12(a.startTime)}
                      </td>
                      <td className="px-5 py-3">
                        <Badge status={a.status}>{a.status}</Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="h-2" />
        </Card>
      )}

      {wizardOpen && <NewBookingWizard onClose={() => setWizardOpen(false)} />}
      <div className="h-6" />
    </PageShell>
  );
}

function NewBookingWizard({ onClose }: { onClose: () => void }) {
  const { clients } = useClientStore();
  const { cls } = useCLStore();
  const { packages } = useSettings();
  const { addBooking } = useAssignmentStore();
  const { logAction } = useActivityLog();

  const [step, setStep] = useState(1);
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerPhone, setNewCustomerPhone] = useState('');
  const [packageId, setPackageId] = useState<string | null>(null);
  const [tierDays, setTierDays] = useState<number | null>(null);
  const [clId, setClId] = useState<string | null>(null);
  const [confirmedBookingId, setConfirmedBookingId] = useState<string | null>(null);

  const selectedPackage = packages.find((p) => p.id === packageId) ?? null;
  const selectedTier = selectedPackage?.tiers.find((t) => t.days === tierDays) ?? null;
  const quoted = selectedTier?.price ?? selectedPackage?.sessionPrice?.perSession ?? 0;
  const customer = customerId ? clients.find((c) => c.id === customerId) : null;
  const customerLocation = customer?.location ?? '';

  const rankedCLs = useMemo(() => {
    const available = cls.filter((c) => c.status === 'available' || c.status === 'on-duty');
    return [...available]
      .map((c) => {
        const tier = c.completedAssignments >= 250 ? 3 : c.completedAssignments >= 150 ? 2 : c.completedAssignments >= 50 ? 1 : 0;
        const proximity = customerLocation && c.location.split(',')[0] === customerLocation.split(',')[0] ? 2 : 0;
        const score = proximity * 10 + tier * 3 + c.rating;
        return { cl: c, score };
      })
      .sort((a, b) => b.score - a.score)
      .map((x) => x.cl);
  }, [cls, customerLocation]);

  const selectedCL = clId ? cls.find((c) => c.id === clId) : null;

  function confirmBooking() {
    if (!customer || !packageId || !clId) return;
    const booking = addBooking({
      clientId: customer.id,
      clId,
      packageId,
      date: toDateStr(TODAY),
      startTime: '09:00',
      endTime: '13:00',
      location: customer.location,
    });
    logAction('Admin Amy', 'Created new booking', `#${booking.id.toUpperCase()} — ${customer.name}`);
    setConfirmedBookingId(booking.id);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-xl rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-black/5 p-4">
          <div>
            <p className="text-sm font-semibold text-brand-ink">New Booking</p>
            {!confirmedBookingId && <p className="text-xs text-brand-muted">Step {step} of 4</p>}
          </div>
          <button onClick={onClose} className="text-brand-muted hover:text-brand-ink">
            <X size={18} />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-5">
          {confirmedBookingId ? (
            <div className="flex flex-col items-center py-6 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-green-light text-brand-green">
                <Check size={28} />
              </div>
              <p className="mt-3 text-lg font-semibold text-brand-ink">Booking confirmed</p>
              <p className="mt-1 font-mono text-sm text-brand-pink">#{confirmedBookingId.toUpperCase()}</p>
              <p className="mt-2 max-w-xs text-sm text-brand-muted">
                {customer?.name} is now matched with {selectedCL?.name} for {selectedPackage?.name}.
              </p>
            </div>
          ) : (
            <>
              {step === 1 && (
                <div>
                  <p className="mb-3 text-sm font-medium text-brand-ink">Choose an existing customer, or add a new one</p>
                  <div className="max-h-52 space-y-1 overflow-y-auto">
                    {clients.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => setCustomerId(c.id)}
                        className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm ${
                          customerId === c.id ? 'bg-brand-pink-light text-brand-pink-dark' : 'hover:bg-brand-cream'
                        }`}
                      >
                        <Avatar name={c.name} size={26} />
                        <span className="min-w-0 flex-1 truncate">{c.name}</span>
                        <span className="text-xs text-brand-muted">{c.location}</span>
                      </button>
                    ))}
                  </div>
                  <div className="mt-4 border-t border-black/5 pt-4">
                    <p className="mb-2 text-xs font-medium text-brand-muted">Or add a new customer</p>
                    <div className="flex gap-2">
                      <input
                        value={newCustomerName}
                        onChange={(e) => setNewCustomerName(e.target.value)}
                        placeholder="Full name"
                        className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm"
                      />
                      <input
                        value={newCustomerPhone}
                        onChange={(e) => setNewCustomerPhone(e.target.value)}
                        placeholder="Phone"
                        className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm"
                      />
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div>
                  <p className="mb-3 text-sm font-medium text-brand-ink">Select package and duration</p>
                  <div className="grid grid-cols-2 gap-2">
                    {packages.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => {
                          setPackageId(p.id);
                          setTierDays(p.tiers[0]?.days ?? null);
                        }}
                        className={`rounded-lg border p-2.5 text-left text-sm ${
                          packageId === p.id ? 'border-brand-pink bg-brand-pink-light text-brand-pink-dark' : 'border-black/10 hover:bg-brand-cream'
                        }`}
                      >
                        {p.shortName}
                      </button>
                    ))}
                  </div>
                  {selectedPackage && selectedPackage.tiers.length > 0 && (
                    <div className="mt-3">
                      <p className="mb-1.5 text-xs font-medium text-brand-muted">Tier / duration</p>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedPackage.tiers.map((t) => (
                          <button
                            key={t.days}
                            onClick={() => setTierDays(t.days)}
                            className={`rounded-full border px-3 py-1 text-xs ${
                              tierDays === t.days ? 'border-brand-pink bg-brand-pink text-white' : 'border-black/10 text-brand-ink hover:bg-brand-cream'
                            }`}
                          >
                            {t.days} Hari / {formatRM(t.price)}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {step === 3 && (
                <div>
                  <p className="mb-3 text-sm font-medium text-brand-ink">System-ranked caregivers for this booking</p>
                  <div className="space-y-2">
                    {rankedCLs.slice(0, 5).map((c, i) => {
                      const tier = c.completedAssignments >= 250 ? 'Platinum' : c.completedAssignments >= 150 ? 'Gold' : c.completedAssignments >= 50 ? 'Silver' : 'Bronze';
                      return (
                        <button
                          key={c.id}
                          onClick={() => setClId(c.id)}
                          className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left ${
                            clId === c.id ? 'border-brand-pink bg-brand-pink-light' : 'border-black/10 hover:bg-brand-cream'
                          }`}
                        >
                          <Avatar name={c.name} color={c.avatarColor} size={36} />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <p className="truncate text-sm font-medium text-brand-ink">{c.name}</p>
                              {i === 0 && (
                                <span className="flex items-center gap-0.5 rounded-full bg-brand-green-light px-2 py-0.5 text-[10px] font-semibold text-brand-green">
                                  <Sparkles size={10} /> Best Match
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-brand-muted">
                              {c.location} · {tier} Tier
                            </p>
                          </div>
                          <span className="flex items-center gap-1 text-xs text-brand-ink">
                            <Star size={12} className="fill-brand-amber text-brand-amber" /> {c.rating}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {step === 4 && (
                <div>
                  <p className="mb-3 text-sm font-medium text-brand-ink">Review & confirm</p>
                  <div className="space-y-2 rounded-xl bg-brand-cream p-4 text-sm">
                    <div className="flex justify-between">
                      <span className="text-brand-muted">Customer</span>
                      <span className="text-brand-ink">{customer?.name ?? newCustomerName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-brand-muted">Package</span>
                      <span className="text-brand-ink">
                        {selectedPackage?.shortName} — {tierDays} Hari
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-brand-muted">Caregiver</span>
                      <span className="text-brand-ink">{selectedCL?.name}</span>
                    </div>
                    <div className="flex justify-between border-t border-black/10 pt-2 font-semibold">
                      <span className="text-brand-ink">Quoted amount</span>
                      <span className="text-brand-pink">{formatRM(quoted)}</span>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-black/5 p-4">
          {confirmedBookingId ? (
            <button onClick={onClose} className="ml-auto rounded-full bg-brand-pink px-5 py-2 text-sm font-medium text-white hover:bg-brand-pink-dark">
              Done
            </button>
          ) : (
            <>
              <button
                onClick={() => setStep((s) => Math.max(1, s - 1))}
                disabled={step === 1}
                className="flex items-center gap-1 rounded-full border border-black/10 px-4 py-2 text-sm text-brand-ink disabled:opacity-30"
              >
                <ChevronLeft size={14} /> Back
              </button>
              {step < 4 ? (
                <button
                  onClick={() => setStep((s) => s + 1)}
                  disabled={(step === 1 && !customerId && !newCustomerName) || (step === 2 && (!packageId || !tierDays)) || (step === 3 && !clId)}
                  className="flex items-center gap-1 rounded-full bg-brand-pink px-4 py-2 text-sm font-medium text-white disabled:opacity-30"
                >
                  Next <ChevronRight size={14} />
                </button>
              ) : (
                <button onClick={confirmBooking} className="rounded-full bg-brand-pink px-5 py-2 text-sm font-medium text-white hover:bg-brand-pink-dark">
                  Confirm Booking
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
