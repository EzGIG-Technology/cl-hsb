import { useState } from 'react';
import { Plus, Trash2, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';
import { PageShell } from '../components/PageShell';
import { Card, SectionTitle, formatRM } from '../components/ui';
import { useSettings } from '../store/SettingsContext';

type Section = 'packages' | 'company' | 'team';

const sections: { id: Section; label: string }[] = [
  { id: 'packages', label: 'Packages & pricing' },
  { id: 'company', label: 'Company profile' },
  { id: 'team', label: 'Admin team' },
];

const inputClass =
  'w-full rounded-lg border border-black/10 px-3 py-2 text-sm text-brand-ink focus:outline-none focus:ring-2 focus:ring-brand-pink';
const labelClass = 'mb-1 block text-xs font-medium text-brand-muted';

export default function SettingsPage() {
  const [section, setSection] = useState<Section>('packages');

  return (
    <PageShell
      title="Settings"
      subtitle="Customise packages, company profile, and admin access."
      sidePanel={
        <div className="flex flex-1 flex-col gap-4">
          <div className="flex flex-col gap-1">
            {sections.map((s) => (
              <button
                key={s.id}
                onClick={() => setSection(s.id)}
                className={`rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                  section === s.id ? 'bg-white font-medium text-brand-maroon-dark' : 'text-white/80 hover:bg-white/10'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
          <div className="mt-auto rounded-2xl bg-white/10 p-4 text-xs text-white/70">
            Changes save automatically to this browser. Use “Reset to defaults” in Packages to restore the original NR
            Mothercare catalogue.
          </div>
        </div>
      }
    >
      <div className="pt-4">
        {section === 'packages' && <PackagesSettings />}
        {section === 'company' && <CompanySettings />}
        {section === 'team' && <TeamSettings />}
      </div>
      <div className="h-6" />
    </PageShell>
  );
}

function PackagesSettings() {
  const { packages, updatePackage, updateTier, addTier, removeTier, addPackage, deletePackage, resetToDefaults } = useSettings();
  const [expanded, setExpanded] = useState<string | null>(packages[0]?.id ?? null);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <SectionTitle>{packages.length} packages</SectionTitle>
        <div className="flex gap-2">
          <button
            onClick={resetToDefaults}
            className="flex items-center gap-1.5 rounded-full border border-black/10 px-3 py-1.5 text-sm text-brand-ink hover:bg-white"
          >
            <RotateCcw size={14} /> Reset to defaults
          </button>
          <button
            onClick={addPackage}
            className="flex items-center gap-1.5 rounded-full bg-brand-maroon px-3 py-1.5 text-sm text-white hover:bg-brand-maroon-dark"
          >
            <Plus size={14} /> Add package
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {packages.map((pkg) => {
          const isOpen = expanded === pkg.id;
          return (
            <Card key={pkg.id} className="!p-0 overflow-hidden">
              <button
                onClick={() => setExpanded(isOpen ? null : pkg.id)}
                className="flex w-full items-center justify-between p-4 text-left"
              >
                <div>
                  <p className="font-semibold text-brand-ink">{pkg.name}</p>
                  <p className="text-xs text-brand-muted">
                    {pkg.tiers.length > 0 ? `${pkg.tiers.length} pricing tiers` : 'Per-session pricing'} · {pkg.durationEstimate}
                    {pkg.estimated && ' · estimated pricing'}
                  </p>
                </div>
                {isOpen ? <ChevronUp size={18} className="text-brand-muted" /> : <ChevronDown size={18} className="text-brand-muted" />}
              </button>

              {isOpen && (
                <div className="border-t border-black/5 p-4 pt-4">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <label className={labelClass}>Package name</label>
                      <input
                        className={inputClass}
                        value={pkg.name}
                        onChange={(e) => updatePackage(pkg.id, { name: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Short name (used in tables)</label>
                      <input
                        className={inputClass}
                        value={pkg.shortName}
                        onChange={(e) => updatePackage(pkg.id, { shortName: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Duration estimate</label>
                      <input
                        className={inputClass}
                        value={pkg.durationEstimate}
                        onChange={(e) => updatePackage(pkg.id, { durationEstimate: e.target.value })}
                      />
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
                      <textarea
                        className={inputClass}
                        rows={2}
                        value={pkg.summary}
                        onChange={(e) => updatePackage(pkg.id, { summary: e.target.value })}
                      />
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
                      <p className="text-xs text-brand-muted">This package uses per-session pricing (edit under Extras).</p>
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
                    <p className="mt-2 text-xs text-brand-muted">
                      Preview: {pkg.tiers.map((t) => `${t.days}d ${formatRM(t.price)}`).join(' · ')}
                    </p>
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <ListEditor
                      key={`${pkg.id}-daily-${pkg.dailyMotherCare.join('|')}`}
                      label="Daily mother care"
                      items={pkg.dailyMotherCare}
                      onChange={(items) => updatePackage(pkg.id, { dailyMotherCare: items })}
                    />
                    <ListEditor
                      key={`${pkg.id}-extras-${pkg.extras.join('|')}`}
                      label="Extras & add-ons"
                      items={pkg.extras}
                      onChange={(items) => updatePackage(pkg.id, { extras: items })}
                    />
                    <ListEditor
                      key={`${pkg.id}-notes-${pkg.notes.join('|')}`}
                      label="Notes"
                      items={pkg.notes}
                      onChange={(items) => updatePackage(pkg.id, { notes: items })}
                    />
                  </div>

                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={() => deletePackage(pkg.id)}
                      className="flex items-center gap-1.5 rounded-full border border-red-200 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50"
                    >
                      <Trash2 size={14} /> Delete package
                    </button>
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function ListEditor({ label, items, onChange }: { label: string; items: string[]; onChange: (items: string[]) => void }) {
  const [text, setText] = useState(items.join('\n'));

  return (
    <div>
      <label className={labelClass}>{label}</label>
      <textarea
        className={inputClass}
        rows={4}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onBlur={() => onChange(text.split('\n').map((s) => s.trim()).filter(Boolean))}
        placeholder="One item per line"
      />
    </div>
  );
}

function CompanySettings() {
  const { company, updateCompany } = useSettings();

  return (
    <Card className="max-w-2xl">
      <SectionTitle>Company profile</SectionTitle>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className={labelClass}>Company name</label>
          <input className={inputClass} value={company.name} onChange={(e) => updateCompany({ name: e.target.value })} />
        </div>
        <div className="sm:col-span-2">
          <label className={labelClass}>Tagline</label>
          <input className={inputClass} value={company.tagline} onChange={(e) => updateCompany({ tagline: e.target.value })} />
        </div>
        <div>
          <label className={labelClass}>Admin Akma — phone</label>
          <input className={inputClass} value={company.adminAkmaPhone} onChange={(e) => updateCompany({ adminAkmaPhone: e.target.value })} />
        </div>
        <div>
          <label className={labelClass}>Admin Amy — phone</label>
          <input className={inputClass} value={company.adminAmyPhone} onChange={(e) => updateCompany({ adminAmyPhone: e.target.value })} />
        </div>
        <div>
          <label className={labelClass}>Email</label>
          <input className={inputClass} value={company.email} onChange={(e) => updateCompany({ email: e.target.value })} />
        </div>
        <div>
          <label className={labelClass}>Service area</label>
          <input className={inputClass} value={company.address} onChange={(e) => updateCompany({ address: e.target.value })} />
        </div>
      </div>
    </Card>
  );
}

function TeamSettings() {
  const { admins, addAdmin, updateAdmin, removeAdmin } = useSettings();

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <SectionTitle>{admins.length} admin users</SectionTitle>
        <button
          onClick={addAdmin}
          className="flex items-center gap-1.5 rounded-full bg-brand-maroon px-3 py-1.5 text-sm text-white hover:bg-brand-maroon-dark"
        >
          <Plus size={14} /> Add admin
        </button>
      </div>
      <div className="space-y-3">
        {admins.map((admin) => (
          <Card key={admin.id}>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-4 sm:items-end">
              <div>
                <label className={labelClass}>Name</label>
                <input className={inputClass} value={admin.name} onChange={(e) => updateAdmin(admin.id, { name: e.target.value })} />
              </div>
              <div>
                <label className={labelClass}>Role</label>
                <input className={inputClass} value={admin.role} onChange={(e) => updateAdmin(admin.id, { role: e.target.value })} />
              </div>
              <div>
                <label className={labelClass}>Phone</label>
                <input className={inputClass} value={admin.phone} onChange={(e) => updateAdmin(admin.id, { phone: e.target.value })} />
              </div>
              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <label className={labelClass}>Email</label>
                  <input className={inputClass} value={admin.email} onChange={(e) => updateAdmin(admin.id, { email: e.target.value })} />
                </div>
                <button
                  onClick={() => removeAdmin(admin.id)}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-red-200 text-red-500 hover:bg-red-50"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
