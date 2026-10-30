import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, X, ChevronRight, ChevronLeft, Star, Sparkles, Check, ClipboardList, MapPin, Info } from 'lucide-react';
import { PageShell } from '../components/PageShell';
import { PackageArt } from '../components/PackageArt';
import { Card, Badge, Avatar, formatRM } from '../components/ui';
import { useAssignmentStore } from '../store/AssignmentStore';
import { useClientStore } from '../store/ClientStore';
import { useCLStore } from '../store/CLStore';
import { useSettings } from '../store/SettingsContext';
import { useActivityLog } from '../store/ActivityLogContext';
import { formatDateLabel, formatTime12, TODAY, toDateStr } from '../lib/date';
import { staffPath, type AssignmentStatus, type Client, type Package, type Staff } from '../types';

type Tab = 'unassigned' | 'active' | 'completed' | 'cancelled';

const statusLabels: Record<AssignmentStatus, string> = {
  confirmed: 'Confirmed',
  pending: 'Pending',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

/** New bookings default to the first slot of the day: the spa opens at 10.30am. */
const DEFAULT_START = '10:30';

function addMinutes(time: string, minutes: number) {
  const [h, m] = time.split(':').map(Number);
  const total = h * 60 + m + minutes;
  return `${String(Math.floor(total / 60) % 24).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`; // taste-skill-ignore: clock time, not index numbering
}

export default function BookingsPage() {
  const { assignments, unassignedClientIds } = useAssignmentStore();
  const { clients } = useClientStore();
  const { cls } = useCLStore();
  const { packageById } = useSettings();
  const [tab, setTab] = useState<Tab>('unassigned');
  const [areaFilter, setAreaFilter] = useState('all');
  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardClientId, setWizardClientId] = useState<string | null>(null);

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

  function openWizard(clientId: string | null = null) {
    setWizardClientId(clientId);
    setWizardOpen(true);
  }

  const bookingRows = tab === 'active' ? filteredActive : tab === 'completed' ? filteredCompleted : filteredCancelled;

  return (
    <PageShell
      title="Bookings"
      subtitle="Every booking from the customer's request to matched staff, a finished session and payroll."
      icon={ClipboardList}
      headerAction={
        <button
          onClick={() => openWizard()}
          className="flex items-center gap-1.5 rounded-full bg-brand-pink px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-pink-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink focus-visible:ring-offset-2"
        >
          <Plus size={16} /> New booking
        </button>
      }
    >
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2" role="tablist">
          {tabs.map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink ${
                tab === t.id ? 'bg-brand-pink text-white' : 'bg-white text-brand-ink hover:bg-brand-pink-light'
              }`}
            >
              {t.label}
              <span
                className={`min-w-6 rounded-full px-1.5 text-center text-xs tabular-nums ${
                  tab === t.id ? 'bg-white/20 text-white' : 'bg-brand-cream text-brand-muted'
                }`}
              >
                {t.count}
              </span>
            </button>
          ))}
        </div>
        <label className="flex items-center gap-2 text-sm text-brand-muted">
          <MapPin size={15} className="text-brand-lavender" />
          <span className="sr-only">Filter by area</span>
          <select
            value={areaFilter}
            onChange={(e) => setAreaFilter(e.target.value)}
            className="rounded-full bg-white px-4 py-2 text-sm text-brand-ink focus:outline-none focus:ring-2 focus:ring-brand-pink"
          >
            <option value="all">All areas</option>
            {areas.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </label>
      </div>

      {tab === 'unassigned' && (
        <Card className="!p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-sm text-brand-muted">
                  <th className="px-6 py-4 font-medium">Customer</th>
                  <th className="px-6 py-4 font-medium">Treatment</th>
                  <th className="px-6 py-4 font-medium">Area</th>
                  <th className="px-6 py-4 font-medium">Preferred date</th>
                  <th className="px-6 py-4 font-medium">
                    <span className="sr-only">Action</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredUnassigned.map((c) => (
                  <tr key={c.id} className="border-t border-brand-cream">{/* taste-skill-ignore: table row */}
                    <td className="px-6 py-3.5">
                      <Link to={`/customers/${c.id}`} className="flex items-center gap-3 hover:underline">
                        <Avatar name={c.name} size={30} />
                        <span className="font-medium text-brand-ink">{c.name}</span>
                      </Link>
                    </td>
                    <td className="px-6 py-3.5 text-brand-ink">{packageById(c.packageIds[0])?.shortName ?? 'Not chosen yet'}</td>
                    <td className="px-6 py-3.5 text-brand-ink">{c.location}</td>
                    <td className="px-6 py-3.5 tabular-nums text-brand-ink">{c.preferredDate ? formatDateLabel(c.preferredDate) : 'Any day'}</td>
                    <td className="px-6 py-3.5 text-right">
                      <button
                        onClick={() => openWizard(c.id)}
                        className="rounded-full bg-brand-pink-light px-4 py-1.5 text-sm font-medium text-brand-pink transition-colors hover:bg-brand-pink hover:text-white"
                      >
                        Assign staff
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredUnassigned.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-sm text-brand-muted">
                      Every booking in this area has staff assigned.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="h-2" />
        </Card>
      )}

      {tab !== 'unassigned' && (
        <Card className="!p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-sm text-brand-muted">
                  <th className="px-6 py-4 font-medium">Booking</th>
                  <th className="px-6 py-4 font-medium">Customer</th>
                  <th className="px-6 py-4 font-medium">Staff</th>
                  <th className="px-6 py-4 font-medium">Treatment</th>
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {bookingRows.map((a) => {
                  const client = clients.find((c) => c.id === a.clientId);
                  const cl = cls.find((c) => c.id === a.clId);
                  const pkg = packageById(a.packageId);
                  return (
                    <tr key={a.id} className="border-t border-brand-cream">{/* taste-skill-ignore: table row */}
                      <td className="px-6 py-3.5 tabular-nums text-brand-muted">#{a.id.toUpperCase()}</td>
                      <td className="px-6 py-3.5">
                        {client && (
                          <Link to={`/customers/${client.id}`} className="font-medium text-brand-ink hover:underline">
                            {client.name}
                          </Link>
                        )}
                      </td>
                      <td className="px-6 py-3.5">
                        {cl && (
                          <Link to={staffPath(cl)} className="flex items-center gap-2.5 hover:underline">
                            <Avatar name={cl.name} color={cl.avatarColor} size={28} />
                            <span className="text-brand-ink">{cl.name}</span>
                          </Link>
                        )}
                      </td>
                      <td className="px-6 py-3.5 text-brand-ink">{pkg?.shortName}</td>
                      <td className="px-6 py-3.5 tabular-nums text-brand-ink">
                        {formatDateLabel(a.date)} · {formatTime12(a.startTime)}
                      </td>
                      <td className="px-6 py-3.5">
                        <Badge status={a.status}>{statusLabels[a.status]}</Badge>
                      </td>
                    </tr>
                  );
                })}
                {bookingRows.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-sm text-brand-muted">
                      No {tab} bookings{areaFilter === 'all' ? '' : ` in ${areaFilter}`}.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="h-2" />
        </Card>
      )}

      {wizardOpen && <NewBookingWizard initialClientId={wizardClientId} onClose={() => setWizardOpen(false)} />}
      <div className="h-6" />
    </PageShell>
  );
}

function specialtyMatches(cl: Staff, pkg: Package | null): boolean {
  if (!pkg) return false;
  const pkgText = `${pkg.name} ${pkg.summary} ${pkg.category}`.toLowerCase();
  return cl.specialties.some((s) =>
    s
      .toLowerCase()
      .split(/\s+/)
      .filter((w) => w.length > 3)
      .some((w) => pkgText.includes(w)),
  );
}

const WIZARD_STEPS = ['Customer', 'Treatment', 'Staff', 'Confirm'] as const;

function NewBookingWizard({ onClose, initialClientId }: { onClose: () => void; initialClientId: string | null }) {
  const { clients, addClient } = useClientStore();
  const { cls } = useCLStore();
  const { packages } = useSettings();
  const { addBooking } = useAssignmentStore();
  const { logAction } = useActivityLog();

  const [step, setStep] = useState(1);
  const [customerId, setCustomerId] = useState<string | null>(initialClientId);
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerPhone, setNewCustomerPhone] = useState('');
  const [newCustomerLocation, setNewCustomerLocation] = useState('');
  const [packageId, setPackageId] = useState<string | null>(null);
  const [tierMinutes, setTierMinutes] = useState<number | null>(null);
  const [clId, setClId] = useState<string | null>(null);
  const [confirmedBookingId, setConfirmedBookingId] = useState<string | null>(null);
  const [confirmedCustomer, setConfirmedCustomer] = useState<Client | null>(null);

  const selectedPackage = packages.find((p) => p.id === packageId) ?? null;
  const selectedTier = selectedPackage?.tiers.find((t) => t.minutes === tierMinutes) ?? null;
  const quoted = selectedTier?.price ?? 0;
  const customer = customerId ? clients.find((c) => c.id === customerId) : null;
  const customerLocation = customer?.location ?? newCustomerLocation;
  const bookingDate = toDateStr(TODAY);
  const startTime = DEFAULT_START;
  const endTime = addMinutes(startTime, tierMinutes ?? 60);

  // Ranked by specialty fit first, then area, then experience tier and rating. Anyone on leave or off duty is left out.
  const rankedCLs = useMemo(() => {
    const available = cls.filter(
      (c) =>
        (c.status === 'available' || c.status === 'on-duty') &&
        !c.leavePeriods.some((p) => bookingDate >= p.start && bookingDate <= p.end),
    );
    return available
      .map((c) => {
        const tier = c.completedAssignments >= 250 ? 3 : c.completedAssignments >= 150 ? 2 : c.completedAssignments >= 50 ? 1 : 0;
        const sameArea = Boolean(customerLocation) && c.location.split(',')[0] === customerLocation.split(',')[0];
        const specialtyFit = specialtyMatches(c, selectedPackage);
        const score = (specialtyFit ? 15 : 0) + (sameArea ? 10 : 0) + tier * 2 + c.rating;
        return { cl: c, score, sameArea, specialtyFit };
      })
      .sort((a, b) => b.score - a.score);
  }, [cls, customerLocation, selectedPackage, bookingDate]);

  const selectedCL = clId ? cls.find((c) => c.id === clId) : null;

  function confirmBooking() {
    const finalCustomer =
      customer ??
      (newCustomerName.trim() && newCustomerLocation.trim()
        ? addClient({ name: newCustomerName.trim(), phone: newCustomerPhone.trim(), location: newCustomerLocation.trim() })
        : null);
    if (!finalCustomer || !packageId || !clId) return;
    const booking = addBooking({
      clientId: finalCustomer.id,
      clId,
      packageId,
      date: bookingDate,
      startTime,
      endTime,
      location: finalCustomer.location,
    });
    logAction('Front Desk', 'Created new booking', `#${booking.id.toUpperCase()} · ${finalCustomer.name}`);
    setConfirmedCustomer(finalCustomer);
    setConfirmedBookingId(booking.id);
  }

  const canAdvance =
    !(step === 1 && !customerId && !(newCustomerName.trim() && newCustomerPhone.trim() && newCustomerLocation.trim())) &&
    !(step === 2 && (!packageId || !tierMinutes)) &&
    !(step === 3 && !clId);

  const fieldClass = 'w-full rounded-xl bg-white px-4 py-2.5 text-sm text-brand-ink placeholder:text-brand-muted focus:outline-none focus:ring-2 focus:ring-brand-pink';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal="true" aria-labelledby="new-booking-title">
      <div className="flex max-h-[90vh] w-full max-w-xl flex-col rounded-3xl bg-white shadow-xl">{/* taste-skill-ignore: overlay */}
        <div className="flex items-start justify-between gap-4 px-6 pt-6">
          <div>
            <h2 id="new-booking-title" className="text-lg font-semibold text-brand-ink">
              New booking
            </h2>
            {!confirmedBookingId && (
              <ol className="mt-3 flex flex-wrap items-center gap-1 text-sm" aria-label="Booking steps">
                {WIZARD_STEPS.map((label, i) => {
                  const position = i + 1;
                  const state = position === step ? 'current' : position < step ? 'done' : 'todo';
                  return (
                    <li key={label} className="flex items-center gap-1" aria-current={state === 'current' ? 'step' : undefined}>
                      <span
                        className={`rounded-full px-3 py-1 transition-colors ${
                          state === 'current'
                            ? 'bg-brand-pink font-medium text-white'
                            : state === 'done'
                              ? 'text-brand-ink'
                              : 'text-brand-muted'
                        }`}
                      >
                        {label}
                      </span>
                      {position < WIZARD_STEPS.length && <ChevronRight size={14} className="text-brand-muted" aria-hidden />}
                    </li>
                  );
                })}
              </ol>
            )}
          </div>
          <button onClick={onClose} aria-label="Close" className="rounded-full p-1.5 text-brand-muted transition-colors hover:bg-brand-cream hover:text-brand-ink">
            <X size={18} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
          {confirmedBookingId ? (
            <div className="flex flex-col items-center py-6 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-lavender-light text-brand-lavender">
                <Check size={28} />
              </div>
              <p className="mt-4 text-lg font-semibold text-brand-ink">Booking confirmed</p>
              <p className="mt-1 text-sm font-medium tabular-nums text-brand-pink">#{confirmedBookingId.toUpperCase()}</p>
              <p className="mt-3 max-w-sm text-sm text-brand-ink">
                {confirmedCustomer?.name} is booked with {selectedCL?.name} for {selectedPackage?.name}
                {tierMinutes ? ` (${tierMinutes} min)` : ''}, {formatDateLabel(bookingDate)} at {formatTime12(startTime)}.
              </p>
            </div>
          ) : (
            <>
              {step === 1 && (
                <div>
                  <p className="mb-3 text-sm text-brand-muted">Pick a customer, or add someone new.</p>
                  <div className="max-h-56 space-y-1 overflow-y-auto">
                    {clients.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => setCustomerId(c.id)}
                        className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors ${
                          customerId === c.id ? 'bg-brand-pink-light text-brand-pink-dark' : 'text-brand-ink hover:bg-brand-cream'
                        }`}
                      >
                        <Avatar name={c.name} size={30} />
                        <span className="min-w-0 flex-1 truncate font-medium">{c.name}</span>
                        <span className="text-xs text-brand-muted">{c.location}</span>
                        {customerId === c.id && <Check size={16} className="text-brand-pink" />}
                      </button>
                    ))}
                  </div>
                  <div className="mt-5 rounded-2xl bg-brand-cream p-4">
                    <p className="mb-3 text-sm font-medium text-brand-ink">New customer</p>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      <input
                        value={newCustomerName}
                        onChange={(e) => {
                          setNewCustomerName(e.target.value);
                          if (e.target.value) setCustomerId(null);
                        }}
                        placeholder="Full name"
                        aria-label="Full name"
                        className={fieldClass}
                      />
                      <input
                        value={newCustomerPhone}
                        onChange={(e) => setNewCustomerPhone(e.target.value)}
                        placeholder="Phone"
                        aria-label="Phone"
                        className={fieldClass}
                      />
                    </div>
                    <input
                      value={newCustomerLocation}
                      onChange={(e) => setNewCustomerLocation(e.target.value)}
                      placeholder="Area (e.g. Kajang, Selangor)"
                      aria-label="Area"
                      className={`mt-2 ${fieldClass}`}
                    />
                  </div>
                </div>
              )}

              {step === 2 && (
                <div>
                  <p className="mb-3 text-sm text-brand-muted">Choose the treatment, then the session length.</p>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {packages.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => {
                          setPackageId(p.id);
                          setTierMinutes(p.tiers[0]?.minutes ?? null);
                        }}
                        className={`flex items-center gap-3 rounded-xl p-2.5 text-left text-sm transition-colors ${
                          packageId === p.id ? 'bg-brand-pink-light text-brand-pink-dark' : 'bg-brand-cream text-brand-ink hover:bg-brand-pink-light/60'
                        }`}
                      >
                        <PackageArt pkg={p} size={36} rounded="rounded-lg" />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate font-medium">{p.shortName}</span>
                          <span className="block text-xs text-brand-muted">
                            from {formatRM(Math.min(...p.tiers.map((t) => t.price)))}
                            {p.estimated ? ' · est.' : ''}
                          </span>
                        </span>
                      </button>
                    ))}
                  </div>
                  {selectedPackage && selectedPackage.tiers.length > 0 && (
                    <div className="mt-6">
                      <p className="mb-2 text-sm font-medium text-brand-ink">Session length</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedPackage.tiers.map((t) => (
                          <button
                            key={t.minutes}
                            onClick={() => setTierMinutes(t.minutes)}
                            className={`rounded-full px-4 py-2 text-sm tabular-nums transition-colors ${
                              tierMinutes === t.minutes ? 'bg-brand-pink text-white' : 'bg-brand-cream text-brand-ink hover:bg-brand-pink-light'
                            }`}
                          >
                            {t.minutes} min · {formatRM(t.price)}
                          </button>
                        ))}
                      </div>
                      {selectedPackage.estimated && <EstimatedNote />}
                    </div>
                  )}
                </div>
              )}

              {step === 3 && (
                <div>
                  <p className="mb-3 text-sm text-brand-muted">Staff ranked by specialty fit, area, rating and availability.</p>
                  <div className="space-y-2">
                    {rankedCLs.slice(0, 5).map(({ cl: c, sameArea, specialtyFit }, i) => {
                      const tier = c.completedAssignments >= 250 ? 'Platinum' : c.completedAssignments >= 150 ? 'Gold' : c.completedAssignments >= 50 ? 'Silver' : 'Bronze';
                      return (
                        <button
                          key={c.id}
                          onClick={() => setClId(c.id)}
                          className={`flex w-full items-center gap-3 rounded-2xl p-3.5 text-left transition-colors ${
                            clId === c.id ? 'bg-brand-pink-light' : 'bg-brand-cream hover:bg-brand-pink-light/60'
                          }`}
                        >
                          <Avatar name={c.name} color={c.avatarColor} size={40} />
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="truncate text-sm font-medium text-brand-ink">{c.name}</p>
                              {i === 0 && (
                                <span className="flex items-center gap-1 rounded-full bg-brand-lavender px-2 py-0.5 text-xs font-medium text-white">
                                  <Sparkles size={12} /> Best match
                                </span>
                              )}
                            </div>
                            <p className="mt-0.5 text-xs text-brand-muted">
                              {c.location} · {tier} tier
                              {specialtyFit ? ' · specialty fit' : ''}
                              {sameArea ? ' · same area' : ''}
                            </p>
                          </div>
                          <span className="flex items-center gap-1 text-sm tabular-nums text-brand-ink">
                            <Star size={14} className="fill-brand-amber text-brand-amber" /> {c.rating}
                          </span>
                        </button>
                      );
                    })}
                    {rankedCLs.length === 0 && (
                      <p className="rounded-2xl bg-brand-cream p-4 text-sm text-brand-muted">No staff member is free today. Try another date from the Schedule page.</p>
                    )}
                  </div>
                </div>
              )}

              {step === 4 && (
                <div>
                  <p className="mb-3 text-sm text-brand-muted">Check the details, then confirm.</p>
                  <dl className="space-y-3 rounded-2xl bg-brand-cream p-5 text-sm">
                    <SummaryRow label="Customer" value={customer?.name ?? newCustomerName} />
                    <SummaryRow label="Treatment" value={`${selectedPackage?.shortName ?? ''} · ${tierMinutes} min`} />
                    <SummaryRow label="Staff" value={selectedCL?.name ?? ''} />
                    <SummaryRow label="When" value={`${formatDateLabel(bookingDate)}, ${formatTime12(startTime)} to ${formatTime12(endTime)}`} />
                    <SummaryRow label="Where" value={customerLocation} />
                  </dl>
                  <div className="mt-5 flex items-end justify-between px-1">
                    <span className="text-sm text-brand-muted">{selectedPackage?.estimated ? 'Est. price' : 'Price'}</span>
                    <span className="text-4xl font-semibold tracking-tight tabular-nums text-brand-pink">{formatRM(quoted)}</span>
                  </div>
                  {selectedPackage?.estimated && <EstimatedNote />}
                </div>
              )}
            </>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 rounded-b-3xl bg-brand-cream px-6 py-4">
          {confirmedBookingId ? (
            <button onClick={onClose} className="ml-auto rounded-full bg-brand-pink px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-pink-dark">
              Done
            </button>
          ) : (
            <>
              <button
                onClick={() => setStep((s) => Math.max(1, s - 1))}
                disabled={step === 1}
                className="flex items-center gap-1 rounded-full bg-white px-4 py-2.5 text-sm text-brand-ink transition-colors hover:bg-brand-pink-light disabled:opacity-30"
              >
                <ChevronLeft size={15} /> Back
              </button>
              {step < 4 ? (
                <button
                  onClick={() => setStep((s) => s + 1)}
                  disabled={!canAdvance}
                  className="flex items-center gap-1 rounded-full bg-brand-pink px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-pink-dark disabled:opacity-30"
                >
                  Next <ChevronRight size={15} />
                </button>
              ) : (
                <button onClick={confirmBooking} className="rounded-full bg-brand-pink px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-pink-dark">
                  Confirm booking
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-brand-muted">{label}</dt>
      <dd className="text-right font-medium text-brand-ink">{value}</dd>
    </div>
  );
}

function EstimatedNote() {
  return (
    <p className="mt-3 flex items-start gap-2 rounded-xl bg-brand-amber-light px-3 py-2.5 text-sm text-brand-ink">
      <Info size={15} className="mt-0.5 shrink-0 text-brand-amber" />
      Est. price. This treatment is not on the published price list yet, so confirm the price with the customer before the session.
    </p>
  );
}
