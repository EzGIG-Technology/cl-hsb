import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, MapPin } from 'lucide-react';
import { PageShell } from '../components/PageShell';
import { PackageArt } from '../components/PackageArt';
import { Card, SectionTitle } from '../components/ui';
import { useSettings } from '../store/SettingsContext';
import { useActivityLog } from '../store/ActivityLogContext';
import type { SlotCadence } from '../types';

const inputClass = 'w-full rounded-lg border border-black/10 px-3 py-2 text-sm text-brand-ink focus:outline-none focus:ring-2 focus:ring-brand-pink';
const labelClass = 'mb-1 block text-xs font-medium text-brand-muted';
const cadences: SlotCadence[] = ['daily', 'weekly', 'monthly'];

export default function PackageDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { packages, updatePackage, updateTier, addTier, removeTier, deletePackage, getPackageAvailability, updatePackageSlot } = useSettings();
  const { logAction } = useActivityLog();

  const pkg = packages.find((p) => p.id === id);
  const [dailyText, setDailyText] = useState(pkg?.dailyMotherCare.join('\n') ?? '');
  const [extrasText, setExtrasText] = useState(pkg?.extras.join('\n') ?? '');

  if (!pkg) {
    return (
      <PageShell title="Package not found">
        <Link to="/packages" className="text-brand-pink underline">
          Back to Packages
        </Link>
      </PageShell>
    );
  }

  const availability = getPackageAvailability(pkg.id);

  return (
    <PageShell title={pkg.name} subtitle="Edit pricing, treatments, and weekly slot availability by location.">
      <button onClick={() => navigate('/packages')} className="mb-4 flex items-center gap-2 text-sm text-brand-muted hover:text-brand-ink">
        <ArrowLeft size={15} /> Back to Packages
      </button>

      <div className="mb-5 flex items-center gap-3">
        <PackageArt pkg={pkg} size={64} />
        <div>
          <p className="text-lg font-semibold text-brand-ink">{pkg.name}</p>
          <p className="text-sm text-brand-muted">{pkg.durationEstimate} · {pkg.category}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-5">
          <Card>
            <SectionTitle>Package details</SectionTitle>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Package name</label>
                <input className={inputClass} value={pkg.name} onChange={(e) => updatePackage(pkg.id, { name: e.target.value })} />
              </div>
              <div>
                <label className={labelClass}>Short name</label>
                <input className={inputClass} value={pkg.shortName} onChange={(e) => updatePackage(pkg.id, { shortName: e.target.value })} />
              </div>
              <div>
                <label className={labelClass}>Duration estimate</label>
                <input className={inputClass} value={pkg.durationEstimate} onChange={(e) => updatePackage(pkg.id, { durationEstimate: e.target.value })} />
              </div>
              <div>
                <label className={labelClass}>Booking deposit (%)</label>
                <input
                  type="number"
                  className={inputClass}
                  value={pkg.bookingDepositPct}
                  onChange={(e) => updatePackage(pkg.id, { bookingDepositPct: Number(e.target.value) })}
                />
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass}>Summary</label>
                <textarea className={inputClass} rows={2} value={pkg.summary} onChange={(e) => updatePackage(pkg.id, { summary: e.target.value })} />
              </div>
            </div>

            <div className="mt-4">
              <div className="mb-2 flex items-center justify-between">
                <label className={labelClass}>Day-tier pricing</label>
                <button
                  onClick={() => addTier(pkg.id)}
                  className="flex items-center gap-1 rounded-full border border-black/10 px-2.5 py-1 text-xs text-brand-ink hover:bg-brand-cream"
                >
                  <Plus size={12} /> Add tier
                </button>
              </div>
              {pkg.tiers.length === 0 ? (
                <p className="text-xs text-brand-muted">This package uses per-session pricing.</p>
              ) : (
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {pkg.tiers.map((tier) => (
                    <div key={tier.days} className="flex items-center gap-1 rounded-lg border border-black/10 px-2 py-1.5">
                      <span className="text-xs text-brand-muted">{tier.days}d</span>
                      <input
                        type="number"
                        value={tier.price}
                        onChange={(e) => updateTier(pkg.id, tier.days, Number(e.target.value))}
                        className="w-full min-w-0 flex-1 text-sm focus:outline-none"
                      />
                      <button onClick={() => removeTier(pkg.id, tier.days)} className="text-brand-muted hover:text-red-500">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Daily mother care</label>
                <textarea
                  className={inputClass}
                  rows={4}
                  value={dailyText}
                  onChange={(e) => setDailyText(e.target.value)}
                  onBlur={() => updatePackage(pkg.id, { dailyMotherCare: dailyText.split('\n').map((s) => s.trim()).filter(Boolean) })}
                />
              </div>
              <div>
                <label className={labelClass}>Extras & add-ons</label>
                <textarea
                  className={inputClass}
                  rows={4}
                  value={extrasText}
                  onChange={(e) => setExtrasText(e.target.value)}
                  onBlur={() => updatePackage(pkg.id, { extras: extrasText.split('\n').map((s) => s.trim()).filter(Boolean) })}
                />
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                onClick={() => {
                  deletePackage(pkg.id);
                  logAction('Admin Amy', 'Deleted package', pkg.name);
                  navigate('/packages');
                }}
                className="flex items-center gap-1.5 rounded-full border border-red-200 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50"
              >
                <Trash2 size={14} /> Delete package
              </button>
            </div>
          </Card>
        </div>

        <Card className="h-fit">
          <SectionTitle>Availability by location</SectionTitle>
          <p className="mb-3 -mt-2 text-xs text-brand-muted">
            Each location can take a limited number of {pkg.shortName} bookings — set the cadence and cap.
          </p>
          <div className="space-y-3">
            {availability.map((slot) => (
              <div key={slot.location} className="rounded-xl border border-black/5 p-3">
                <div className="mb-2 flex items-center gap-1.5 text-sm font-medium text-brand-ink">
                  <MapPin size={13} className="text-brand-pink" /> {slot.location}
                </div>
                <div className="flex gap-2">
                  <select
                    value={slot.cadence}
                    onChange={(e) => {
                      updatePackageSlot(pkg.id, slot.location, { cadence: e.target.value as SlotCadence });
                      logAction('Admin Amy', 'Updated package availability cadence', `${pkg.shortName} @ ${slot.location} → ${e.target.value}`);
                    }}
                    className="w-1/2 rounded-md border border-black/10 px-2 py-1.5 text-xs text-brand-ink"
                  >
                    {cadences.map((c) => (
                      <option key={c} value={c}>
                        {c[0].toUpperCase() + c.slice(1)}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    value={slot.slots}
                    onChange={(e) => updatePackageSlot(pkg.id, slot.location, { slots: Number(e.target.value) })}
                    onBlur={() => logAction('Admin Amy', 'Updated package slot cap', `${pkg.shortName} @ ${slot.location} → ${slot.slots} slots`)}
                    className="w-1/2 rounded-md border border-black/10 px-2 py-1.5 text-xs text-brand-ink"
                  />
                </div>
                <p className="mt-1 text-[10px] text-brand-muted">
                  {slot.slots} slots per {slot.cadence.replace('ly', '')}
                </p>
              </div>
            ))}
          </div>
        </Card>
      </div>
      <div className="h-6" />
    </PageShell>
  );
}
