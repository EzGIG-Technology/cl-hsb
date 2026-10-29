import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, MapPin, Store } from 'lucide-react';
import { PageShell } from '../components/PageShell';
import { PackageArt } from '../components/PackageArt';
import { Card, SectionTitle, formatRM } from '../components/ui';
import { useSettings } from '../store/SettingsContext';
import { useActivityLog } from '../store/ActivityLogContext';
import type { PackageCategory, SlotCadence } from '../types';

const inputClass =
  'w-full rounded-xl bg-brand-cream px-3 py-2.5 text-sm text-brand-ink placeholder:text-brand-muted focus:outline-none focus:ring-2 focus:ring-brand-pink';
const labelClass = 'mb-1.5 block text-sm font-medium text-brand-ink';
const hintClass = 'mt-1.5 text-xs text-brand-muted';
const cadences: SlotCadence[] = ['daily', 'weekly', 'monthly'];
const categories: { id: PackageCategory; label: string }[] = [
  { id: 'massage', label: 'Massage' },
  { id: 'prenatal', label: 'Prenatal' },
  { id: 'treatment', label: 'Treatment' },
  { id: 'promo', label: 'Promotion' },
];

/** Locations in the availability list that stand for the outlet itself rather than a home-service area. */
const IN_SPA_PATTERN = /sentral|in-spa|outlet/i;

function linesOf(text: string) {
  return text
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean);
}

export default function PackageDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { packages, company, updatePackage, updateTier, addTier, removeTier, deletePackage, getPackageAvailability, updatePackageSlot } =
    useSettings();
  const { logAction } = useActivityLog();

  const pkg = packages.find((p) => p.id === id);
  const [stepsText, setStepsText] = useState(pkg?.treatmentSteps.join('\n') ?? '');
  const [extrasText, setExtrasText] = useState(pkg?.extras.join('\n') ?? '');
  const [notesText, setNotesText] = useState(pkg?.notes.join('\n') ?? '');

  if (!pkg) {
    return (
      <PageShell title="Treatment not found">
        <Link to="/packages" className="text-brand-pink underline">
          Back to treatments & prices
        </Link>
      </PageShell>
    );
  }

  const availability = getPackageAvailability(pkg.id);
  const inSpaSlots = availability.filter((s) => IN_SPA_PATTERN.test(s.location));
  const homeSlots = availability.filter((s) => !IN_SPA_PATTERN.test(s.location));
  const categoryLabel = categories.find((c) => c.id === pkg.category)?.label ?? pkg.category;

  function setTierMinutes(index: number, minutes: number) {
    if (!pkg) return;
    updatePackage(pkg.id, { tiers: pkg.tiers.map((t, i) => (i === index ? { ...t, minutes } : t)) });
  }

  function renderSlot(slot: (typeof availability)[number]) {
    if (!pkg) return null;
    return (
      <div key={slot.location} className="rounded-xl bg-brand-cream p-3">
        <div className="flex items-center justify-between gap-2">
          <p className="flex min-w-0 items-center gap-1.5 text-sm font-medium text-brand-ink">
            <MapPin size={14} className="shrink-0 text-brand-pink" />
            <span className="truncate">{slot.location}</span>
          </p>
          <p className="shrink-0 text-xs text-brand-muted">
            {slot.slots} per {slot.cadence.replace('ly', '').replace('dai', 'day')}
          </p>
        </div>
        <div className="mt-2 flex gap-2">
          <select
            aria-label={`Cadence for ${slot.location}`}
            value={slot.cadence}
            onChange={(e) => {
              updatePackageSlot(pkg.id, slot.location, { cadence: e.target.value as SlotCadence });
              logAction('Front Desk', 'Updated treatment availability cadence', `${pkg.shortName} @ ${slot.location} → ${e.target.value}`);
            }}
            className="w-1/2 rounded-lg bg-white px-2 py-1.5 text-sm text-brand-ink focus:outline-none focus:ring-2 focus:ring-brand-pink"
          >
            {cadences.map((c) => (
              <option key={c} value={c}>
                {c[0].toUpperCase() + c.slice(1)}
              </option>
            ))}
          </select>
          <input
            aria-label={`Session cap for ${slot.location}`}
            type="number"
            min={0}
            value={slot.slots}
            onChange={(e) => updatePackageSlot(pkg.id, slot.location, { slots: Number(e.target.value) })}
            onBlur={() => logAction('Front Desk', 'Updated treatment session cap', `${pkg.shortName} @ ${slot.location} → ${slot.slots} sessions`)}
            className="w-1/2 rounded-lg bg-white px-2 py-1.5 text-sm text-brand-ink focus:outline-none focus:ring-2 focus:ring-brand-pink"
          />
        </div>
      </div>
    );
  }

  return (
    <PageShell title={pkg.name} subtitle="Edit the price card, the therapist's session checklist and where this treatment can be booked.">
      <button
        onClick={() => navigate('/packages')}
        className="mb-6 flex items-center gap-2 text-sm text-brand-muted transition-colors hover:text-brand-ink"
      >
        <ArrowLeft size={15} /> Back to treatments & prices
      </button>

      <div className="mb-8 flex flex-wrap items-center gap-5">
        <PackageArt pkg={pkg} size={80} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-brand-pink-light px-2.5 py-1 text-xs font-medium text-brand-pink">{categoryLabel}</span>
            {pkg.estimated && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-amber-light px-2.5 py-1 text-xs font-medium text-[#8a5a12]">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-amber" aria-hidden />
                Price to confirm
              </span>
            )}
          </div>
          <p className="mt-2 text-base text-brand-ink">
            {pkg.tiers.length > 0 ? pkg.tiers.map((t) => `${t.minutes} min ${formatRM(t.price)}`).join(' · ') : 'No price set yet'}
          </p>
          {pkg.source && <p className="mt-1 text-xs text-brand-muted">Source: {pkg.source}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card className="p-6">
            <SectionTitle>Treatment details</SectionTitle>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label className={labelClass} htmlFor="pkg-name">
                  Treatment name
                </label>
                <input id="pkg-name" className={inputClass} value={pkg.name} onChange={(e) => updatePackage(pkg.id, { name: e.target.value })} />
              </div>
              <div>
                <label className={labelClass} htmlFor="pkg-short">
                  Short name
                </label>
                <input id="pkg-short" className={inputClass} value={pkg.shortName} onChange={(e) => updatePackage(pkg.id, { shortName: e.target.value })} />
              </div>
              <div>
                <label className={labelClass} htmlFor="pkg-category">
                  Category
                </label>
                <select
                  id="pkg-category"
                  className={inputClass}
                  value={pkg.category}
                  onChange={(e) => updatePackage(pkg.id, { category: e.target.value as PackageCategory })}
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass} htmlFor="pkg-duration">
                  Duration shown to clients
                </label>
                <input
                  id="pkg-duration"
                  className={inputClass}
                  value={pkg.durationEstimate}
                  onChange={(e) => updatePackage(pkg.id, { durationEstimate: e.target.value })}
                />
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass} htmlFor="pkg-summary">
                  Summary
                </label>
                <textarea
                  id="pkg-summary"
                  className={inputClass}
                  rows={2}
                  value={pkg.summary}
                  onChange={(e) => updatePackage(pkg.id, { summary: e.target.value })}
                />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <SectionTitle
              action={
                <button
                  onClick={() => addTier(pkg.id)}
                  className="flex items-center gap-1 rounded-full bg-brand-pink-light px-3 py-1.5 text-sm font-medium text-brand-pink transition-colors hover:bg-brand-pink hover:text-white"
                >
                  <Plus size={14} /> Add session length
                </button>
              }
            >
              Session-length pricing
            </SectionTitle>
            {pkg.tiers.length === 0 ? (
              <p className="text-sm text-brand-muted">No session lengths yet. Add one to put this treatment on the price card.</p>
            ) : (
              <div className="space-y-2">
                <div className="grid grid-cols-[1fr_1fr_2.25rem] gap-3 px-1 text-sm text-brand-muted">
                  <span>Minutes</span>
                  <span>Price (RM)</span>
                  <span />
                </div>
                {pkg.tiers.map((tier, index) => (
                  <div key={index} className="grid grid-cols-[1fr_1fr_2.25rem] items-center gap-3">
                    <input
                      aria-label="Session length in minutes"
                      type="number"
                      min={5}
                      step={5}
                      value={tier.minutes}
                      onChange={(e) => setTierMinutes(index, Number(e.target.value))}
                      className={inputClass}
                    />
                    <input
                      aria-label={`Price for ${tier.minutes} minutes`}
                      type="number"
                      min={0}
                      value={tier.price}
                      onChange={(e) => updateTier(pkg.id, tier.minutes, Number(e.target.value))}
                      onBlur={() => logAction('Front Desk', 'Updated treatment price', `${pkg.shortName} ${tier.minutes} min → ${formatRM(tier.price)}`)}
                      className={inputClass}
                    />
                    <button
                      onClick={() => removeTier(pkg.id, tier.minutes)}
                      aria-label={`Remove ${tier.minutes} min`}
                      className="flex h-9 w-9 items-center justify-center rounded-full text-brand-muted transition-colors hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
              <label className="flex cursor-pointer items-start gap-3 rounded-xl bg-brand-cream p-4">
                <input
                  type="checkbox"
                  checked={!!pkg.estimated}
                  onChange={(e) => {
                    updatePackage(pkg.id, { estimated: e.target.checked });
                    logAction('Front Desk', e.target.checked ? 'Marked price as estimated' : 'Confirmed treatment price', pkg.shortName);
                  }}
                  className="mt-0.5 h-4 w-4 shrink-0 accent-brand-pink"
                />
                <span>
                  <span className="block text-sm font-medium text-brand-ink">Estimated price</span>
                  <span className="block text-xs text-brand-muted">Shows "Price to confirm" until the spa publishes this price.</span>
                </span>
              </label>
              <div>
                <label className={labelClass} htmlFor="pkg-deposit">
                  Booking deposit (%)
                </label>
                <input
                  id="pkg-deposit"
                  type="number"
                  min={0}
                  max={100}
                  className={inputClass}
                  value={pkg.bookingDepositPct}
                  onChange={(e) => updatePackage(pkg.id, { bookingDepositPct: Number(e.target.value) })}
                />
                <p className={hintClass}>0 means pay at the spa, no deposit.</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <SectionTitle>Session checklist</SectionTitle>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className={labelClass} htmlFor="pkg-steps">
                  Treatment steps
                </label>
                <textarea
                  id="pkg-steps"
                  className={inputClass}
                  rows={6}
                  value={stepsText}
                  onChange={(e) => setStepsText(e.target.value)}
                  onBlur={() => updatePackage(pkg.id, { treatmentSteps: linesOf(stepsText) })}
                />
                <p className={hintClass}>One step per line, in order. The therapist ticks these off in the app during the session.</p>
              </div>
              <div>
                <label className={labelClass} htmlFor="pkg-extras">
                  Inclusions
                </label>
                <textarea
                  id="pkg-extras"
                  className={inputClass}
                  rows={4}
                  value={extrasText}
                  onChange={(e) => setExtrasText(e.target.value)}
                  onBlur={() => updatePackage(pkg.id, { extras: linesOf(extrasText) })}
                />
                <p className={hintClass}>What comes with every session, one per line.</p>
              </div>
              <div>
                <label className={labelClass} htmlFor="pkg-notes">
                  Notes
                </label>
                <textarea
                  id="pkg-notes"
                  className={inputClass}
                  rows={4}
                  value={notesText}
                  onChange={(e) => setNotesText(e.target.value)}
                  onBlur={() => updatePackage(pkg.id, { notes: linesOf(notesText) })}
                />
                <p className={hintClass}>For the front desk, one per line.</p>
              </div>
            </div>
          </Card>

          <div className="flex justify-end">
            <button
              onClick={() => {
                deletePackage(pkg.id);
                logAction('Front Desk', 'Deleted treatment', pkg.name);
                navigate('/packages');
              }}
              className="flex items-center gap-1.5 rounded-full bg-red-50 px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-100"
            >
              <Trash2 size={14} /> Delete treatment
            </button>
          </div>
        </div>

        <Card className="h-fit p-6">
          <SectionTitle>Availability by area</SectionTitle>
          <p className="-mt-2 mb-5 text-sm text-brand-muted">How many {pkg.shortName} sessions each place can take.</p>

          <h3 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-brand-ink">
            <Store size={15} className="text-brand-lavender" /> In the spa
          </h3>
          {inSpaSlots.length > 0 ? (
            <div className="space-y-2">{inSpaSlots.map(renderSlot)}</div>
          ) : (
            <div className="rounded-xl bg-brand-lavender-light p-3 text-sm text-brand-ink">
              <p className="font-medium">Bangi Sentral outlet</p>
              <p className="mt-0.5 text-xs text-brand-muted">Bookable whenever a room and therapist are free. {company.hours}.</p>
            </div>
          )}

          <h3 className="mb-2 mt-6 flex items-center gap-1.5 text-sm font-semibold text-brand-ink">
            <MapPin size={15} className="text-brand-lavender" /> Home service
          </h3>
          <p className="mb-3 text-xs text-brand-muted">Cap on home-service sessions per area, so therapists are not booked too far apart.</p>
          <div className="space-y-2">{homeSlots.map(renderSlot)}</div>
        </Card>
      </div>
      <div className="h-6" />
    </PageShell>
  );
}
