import { useNavigate } from 'react-router-dom';
import { Plus, ChevronRight } from 'lucide-react';
import { PageShell } from '../components/PageShell';
import { PackageArt } from '../components/PackageArt';
import { formatRM } from '../components/ui';
import { useSettings } from '../store/SettingsContext';
import { useActivityLog } from '../store/ActivityLogContext';
import type { Package, PackageCategory } from '../types';

/** Menu sections in the order they appear on Honey Spa's price card. */
const CATEGORY_SECTIONS: { id: PackageCategory; label: string; note: string }[] = [
  { id: 'massage', label: 'Massage', note: 'Malay urut and focused massages, in the spa or at home.' },
  { id: 'prenatal', label: 'Prenatal', note: 'Gentle, side-lying massage for expecting customers.' },
  { id: 'treatment', label: 'Treatments', note: 'Traditional baths and face treatments.' },
  { id: 'promo', label: 'Promotions', note: 'Bundles and limited-time offers. Check they are still running.' },
];

/** Honey-coloured tag for a price that is not on the published price list yet. */
function PriceToConfirmTag() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-amber-light px-2.5 py-1 text-xs font-medium text-[#8a5a12]">
      <span className="h-1.5 w-1.5 rounded-full bg-brand-amber" aria-hidden />
      Price to confirm
    </span>
  );
}

function TreatmentRow({ pkg, onOpen }: { pkg: Package; onOpen: () => void }) {
  return (
    <button
      onClick={onOpen}
      className="group flex w-full flex-col gap-4 rounded-2xl bg-white p-5 text-left transition-colors hover:bg-brand-pink-light/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink sm:flex-row sm:items-center sm:gap-6"
    >
      <div className="flex min-w-0 flex-1 items-start gap-4">
        <PackageArt pkg={pkg} size={64} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-lg font-semibold text-brand-ink">{pkg.name}</p>
            {pkg.estimated && <PriceToConfirmTag />}
          </div>
          <p className="mt-1 text-sm text-brand-ink">{pkg.summary}</p>
          {pkg.source && <p className="mt-2 text-xs text-brand-muted">Source: {pkg.source}</p>}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-4 sm:justify-end">
        {pkg.tiers.length === 0 ? (
          <p className="text-sm text-brand-muted">No price set</p>
        ) : (
          <dl className="flex flex-wrap gap-x-6 gap-y-3">
            {pkg.tiers.map((tier) => (
              <div key={tier.minutes} className="min-w-[4.5rem]">
                <dt className="text-sm text-brand-muted">{tier.minutes} min</dt>
                <dd className={`text-xl font-semibold tracking-tight ${pkg.estimated ? 'text-brand-muted' : 'text-brand-ink'}`}>
                  {formatRM(tier.price)}
                </dd>
              </div>
            ))}
          </dl>
        )}
        <ChevronRight size={18} className="hidden shrink-0 text-brand-muted transition-colors group-hover:text-brand-pink sm:block" />
      </div>
    </button>
  );
}

export default function PackagesPage() {
  const { packages, addPackage } = useSettings();
  const { logAction } = useActivityLog();
  const navigate = useNavigate();

  const estimatedCount = packages.filter((p) => p.estimated).length;
  const sections = CATEGORY_SECTIONS.map((s) => ({ ...s, items: packages.filter((p) => p.category === s.id) })).filter(
    (s) => s.items.length > 0,
  );

  return (
    <PageShell
      title="Treatments & prices"
      subtitle="Honey Spa's menu as customers see it, with every session length and price. Open a treatment to edit its pricing, steps and availability by area."
      headerAction={
        <button
          onClick={() => {
            addPackage();
            logAction('Front Desk', 'Added a new treatment');
          }}
          className="flex items-center gap-1.5 rounded-full bg-brand-pink px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-pink-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink focus-visible:ring-offset-2"
        >
          <Plus size={16} /> New treatment
        </button>
      }
    >
      {estimatedCount > 0 && (
        <div className="mb-8 flex flex-wrap items-center gap-3 rounded-2xl bg-brand-amber-light px-5 py-4 text-sm text-brand-ink">
          <PriceToConfirmTag />
          <span>
            {estimatedCount} treatment{estimatedCount === 1 ? ' has' : 's have'} no published price yet. Confirm with the spa manager before quoting a customer.
          </span>
        </div>
      )}

      <div className="space-y-10">
        {sections.map((section) => (
          <section key={section.id}>
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-brand-ink">{section.label}</h2>
              <p className="text-sm text-brand-muted">{section.note}</p>
            </div>
            <div className="space-y-3">
              {section.items.map((pkg) => (
                <TreatmentRow key={pkg.id} pkg={pkg} onOpen={() => navigate(`/packages/${pkg.id}`)} />
              ))}
            </div>
          </section>
        ))}
      </div>
      <div className="h-6" />
    </PageShell>
  );
}
