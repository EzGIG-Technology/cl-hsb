import { useNavigate } from 'react-router-dom';
import { Plus, Package } from 'lucide-react';
import { PageShell } from '../components/PageShell';
import { PackageArt } from '../components/PackageArt';
import { Card, formatRM } from '../components/ui';
import { useSettings } from '../store/SettingsContext';
import { useActivityLog } from '../store/ActivityLogContext';

export default function PackagesPage() {
  const { packages, addPackage } = useSettings();
  const { logAction } = useActivityLog();
  const navigate = useNavigate();

  return (
    <PageShell
      title="Packages & Availability"
      subtitle="Manage every active package, its pricing tiers, and weekly slot limits by location."
      icon={Package}
      accentColor="#38bdf8"
      headerAction={
        <button
          onClick={() => {
            addPackage();
            logAction('Admin Amy', 'Added a new package');
          }}
          className="flex items-center gap-1.5 rounded-full bg-brand-pink px-4 py-2 text-sm font-medium text-white hover:bg-brand-pink-dark"
        >
          <Plus size={15} /> New Package
        </button>
      }
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {packages.map((pkg) => (
          <Card key={pkg.id} className="cursor-pointer transition-shadow hover:shadow-md" onClick={() => navigate(`/packages/${pkg.id}`)}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <PackageArt pkg={pkg} size={48} />
                <div>
                  <p className="font-semibold text-brand-ink">{pkg.name}</p>
                  <p className="text-xs text-brand-muted">{pkg.durationEstimate}</p>
                </div>
              </div>
              <span className="rounded-full bg-brand-pink-light px-2 py-0.5 text-[10px] font-medium text-brand-pink capitalize">{pkg.category}</span>
            </div>
            <p className="mt-2 text-sm text-brand-muted line-clamp-2">{pkg.summary}</p>
            <div className="mt-3 flex items-center justify-between border-t border-black/5 pt-3 text-sm">
              <span className="text-brand-muted">{pkg.tiers.length > 0 ? `${pkg.tiers.length} tiers` : 'Per session'}</span>
              <span className="font-semibold text-brand-ink">
                {pkg.tiers[0] ? formatRM(pkg.tiers[0].price) : pkg.sessionPrice ? formatRM(pkg.sessionPrice.perSession) : '—'}
                {pkg.tiers[0] ? <span className="font-normal text-brand-muted"> from</span> : null}
              </span>
            </div>
          </Card>
        ))}
      </div>
      <div className="h-6" />
    </PageShell>
  );
}
