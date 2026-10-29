import { useState, type ChangeEvent, type ReactNode } from 'react';
import { Plus, Trash2, RotateCcw, Phone, MapPin, Clock, AtSign } from 'lucide-react';
import { PageShell } from '../components/PageShell';
import { Card, SectionTitle } from '../components/ui';
import { Logo } from '../components/Logo';
import { useSettings, ADMIN_ROLES } from '../store/SettingsContext';
import { useCLStore } from '../store/CLStore';
import { useClientStore } from '../store/ClientStore';
import { useAssignmentStore } from '../store/AssignmentStore';
import { useActivityLog } from '../store/ActivityLogContext';

type Section = 'company' | 'team';

const sections: { id: Section; label: string }[] = [
  { id: 'company', label: 'Company profile' },
  { id: 'team', label: 'Admin team' },
];

const inputClass =
  'w-full rounded-xl bg-brand-cream px-3 py-2.5 text-sm text-brand-ink placeholder:text-brand-muted focus:outline-none focus:ring-2 focus:ring-brand-pink';
const labelClass = 'mb-1.5 block text-sm font-medium text-brand-ink';

const roleDescriptions: Record<string, string> = {
  Admin: 'Full access: bookings, therapists, treatments and settings.',
  Operations: 'Bookings, schedule and therapist assignment. No financial data.',
  Finance: 'Revenue, payments and payouts only. No booking or therapist controls.',
};

export default function SettingsPage() {
  const [section, setSection] = useState<Section>('company');
  const [resetDone, setResetDone] = useState(false);
  const { resetToDefaults: resetSettings } = useSettings();
  const { resetToDefaults: resetCLs } = useCLStore();
  const { resetToDefaults: resetClients } = useClientStore();
  const { resetToDefaults: resetAssignments } = useAssignmentStore();
  const { clear: clearActivityLog } = useActivityLog();

  function resetEverything() {
    resetSettings();
    resetCLs();
    resetClients();
    resetAssignments();
    clearActivityLog();
    setResetDone(true);
  }

  return (
    <PageShell
      title="Settings"
      subtitle="Company profile, admin team and demo data."
      headerAction={
        <div className="flex items-center gap-3">
          {resetDone && <span className="text-sm text-brand-muted">Demo data restored.</span>}
          <button
            onClick={resetEverything}
            className="flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-medium text-brand-ink transition-colors hover:bg-brand-pink-light hover:text-brand-pink"
          >
            <RotateCcw size={14} /> Reset demo data
          </button>
        </div>
      }
    >
      <div className="mb-8 flex flex-wrap gap-2" role="tablist">
        {sections.map((s) => (
          <button
            key={s.id}
            role="tab"
            aria-selected={section === s.id}
            onClick={() => setSection(s.id)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              section === s.id ? 'bg-brand-pink text-white' : 'bg-white text-brand-ink hover:bg-brand-pink-light'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>
      {section === 'company' && <CompanySettings />}
      {section === 'team' && <TeamSettings />}
      <div className="h-6" />
    </PageShell>
  );
}

function Field({ label, id, className = '', children }: { label: string; id: string; className?: string; children: ReactNode }) {
  return (
    <div className={className}>
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>
      {children}
    </div>
  );
}

function CompanySettings() {
  const { company, updateCompany } = useSettings();
  const { logAction } = useActivityLog();

  function handleLogoUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      updateCompany({ logoDataUrl: reader.result as string });
      logAction('Spa Manager', 'Updated company logo', file.name);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  }

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
      <Card className="p-6 xl:col-span-2">
        <SectionTitle>Company profile</SectionTitle>

        <div className="mb-8 flex flex-wrap items-center gap-5 rounded-2xl bg-brand-cream p-5">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white">
            {company.logoDataUrl ? (
              <img src={company.logoDataUrl} alt="Company logo" className="h-full w-full object-contain" />
            ) : (
              <Logo variant="icon" size={56} />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-base font-semibold text-brand-ink">Logo</p>
            <p className="text-sm text-brand-muted">A square PNG or SVG works best. It replaces the Honey Spa flower across the dashboard.</p>
            <div className="mt-3 flex gap-2">
              <label className="cursor-pointer rounded-full bg-brand-pink px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-pink-dark focus-within:ring-2 focus-within:ring-brand-pink focus-within:ring-offset-2">
                Upload logo
                <input type="file" accept="image/*" onChange={handleLogoUpload} className="sr-only" />
              </label>
              {company.logoDataUrl && (
                <button
                  onClick={() => {
                    updateCompany({ logoDataUrl: undefined });
                    logAction('Spa Manager', 'Removed company logo');
                  }}
                  className="rounded-full bg-white px-4 py-2 text-sm font-medium text-brand-ink transition-colors hover:bg-brand-pink-light"
                >
                  Remove
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div>
            <h3 className="mb-4 text-base font-semibold text-brand-ink">Brand</h3>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Field label="Company name" id="co-name">
                <input id="co-name" className={inputClass} value={company.name} onChange={(e) => updateCompany({ name: e.target.value })} />
              </Field>
              <Field label="Tagline" id="co-tagline">
                <input id="co-tagline" className={inputClass} value={company.tagline} onChange={(e) => updateCompany({ tagline: e.target.value })} />
              </Field>
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-base font-semibold text-brand-ink">Contact</h3>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
              <Field label="Phone" id="co-phone">
                <input id="co-phone" className={inputClass} value={company.phone} onChange={(e) => updateCompany({ phone: e.target.value })} />
              </Field>
              <Field label="WhatsApp bookings" id="co-whatsapp">
                <input id="co-whatsapp" className={inputClass} value={company.whatsapp} onChange={(e) => updateCompany({ whatsapp: e.target.value })} />
              </Field>
              <Field label="Email" id="co-email">
                <input id="co-email" type="email" className={inputClass} value={company.email} onChange={(e) => updateCompany({ email: e.target.value })} />
              </Field>
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-base font-semibold text-brand-ink">Outlet</h3>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Field label="Address" id="co-address" className="sm:col-span-2">
                <textarea
                  id="co-address"
                  rows={2}
                  className={inputClass}
                  value={company.address}
                  onChange={(e) => updateCompany({ address: e.target.value })}
                />
              </Field>
              <Field label="Opening hours" id="co-hours">
                <input id="co-hours" className={inputClass} value={company.hours} onChange={(e) => updateCompany({ hours: e.target.value })} />
              </Field>
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-base font-semibold text-brand-ink">Social</h3>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Field label="Instagram" id="co-instagram">
                <input id="co-instagram" className={inputClass} value={company.instagram} onChange={(e) => updateCompany({ instagram: e.target.value })} />
              </Field>
              <Field label="Facebook" id="co-facebook">
                <input id="co-facebook" className={inputClass} value={company.facebook} onChange={(e) => updateCompany({ facebook: e.target.value })} />
              </Field>
            </div>
          </div>
        </div>
      </Card>

      <div className="h-fit xl:sticky xl:top-0">
        <p className="mb-3 text-sm text-brand-muted">How clients see it</p>
        <div className="rounded-2xl bg-brand-pink p-6 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white">
              {company.logoDataUrl ? (
                <img src={company.logoDataUrl} alt="" className="h-full w-full object-contain" />
              ) : (
                <Logo variant="icon" size={40} />
              )}
            </div>
            <div className="min-w-0">
              <p className="truncate text-lg font-semibold">{company.name || 'Company name'}</p>
              <p className="truncate text-sm text-white/80">{company.tagline}</p>
            </div>
          </div>
          <ul className="mt-6 space-y-3 text-sm">
            <PreviewLine icon={<Phone size={15} />}>
              {company.phone}
              {company.whatsapp && company.whatsapp !== company.phone ? ` · WhatsApp ${company.whatsapp}` : ' · WhatsApp too'}
            </PreviewLine>
            <PreviewLine icon={<Clock size={15} />}>{company.hours}</PreviewLine>
            <PreviewLine icon={<MapPin size={15} />}>{company.address}</PreviewLine>
            <PreviewLine icon={<AtSign size={15} />}>
              {[company.instagram, company.email].filter(Boolean).join(' · ')}
            </PreviewLine>
          </ul>
        </div>
      </div>
    </div>
  );
}

function PreviewLine({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <li className="flex items-start gap-2.5">
      <span className="mt-0.5 shrink-0 text-white/80">{icon}</span>
      <span className="min-w-0 break-words">{children}</span>
    </li>
  );
}

function TeamSettings() {
  const { admins, addAdmin, updateAdmin, removeAdmin } = useSettings();
  const { logAction } = useActivityLog();

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        {ADMIN_ROLES.map((role) => (
          <div key={role} className="rounded-2xl bg-white p-5">
            <div className="flex items-baseline justify-between gap-2">
              <p className="text-base font-semibold text-brand-ink">{role}</p>
              <p className="text-sm text-brand-muted">
                {admins.filter((a) => a.role === role).length} {admins.filter((a) => a.role === role).length === 1 ? 'person' : 'people'}
              </p>
            </div>
            <p className="mt-1 text-sm text-brand-ink">{roleDescriptions[role] ?? ''}</p>
          </div>
        ))}
      </div>

      <Card className="p-6">
        <SectionTitle
          action={
            <button
              onClick={() => {
                addAdmin();
                logAction('Spa Manager', 'Added a new admin user');
              }}
              className="flex items-center gap-1.5 rounded-full bg-brand-pink px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-pink-dark"
            >
              <Plus size={14} /> Add admin
            </button>
          }
        >
          {admins.length} admin {admins.length === 1 ? 'user' : 'users'}
        </SectionTitle>

        <div className="space-y-3">
          {admins.map((admin) => (
            <div key={admin.id} className="grid grid-cols-1 gap-4 rounded-2xl bg-brand-cream p-4 sm:grid-cols-[1fr_10rem_1fr_1.4fr_2.5rem] sm:items-end">
              <Field label="Name" id={`${admin.id}-name`}>
                <input
                  id={`${admin.id}-name`}
                  className={inputClass.replace('bg-brand-cream', 'bg-white')}
                  value={admin.name}
                  onChange={(e) => updateAdmin(admin.id, { name: e.target.value })}
                />
              </Field>
              <Field label="Role" id={`${admin.id}-role`}>
                <select
                  id={`${admin.id}-role`}
                  className={inputClass.replace('bg-brand-cream', 'bg-white')}
                  value={admin.role}
                  onChange={(e) => updateAdmin(admin.id, { role: e.target.value })}
                >
                  {!ADMIN_ROLES.includes(admin.role as (typeof ADMIN_ROLES)[number]) && <option value={admin.role}>{admin.role}</option>}
                  {ADMIN_ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Phone" id={`${admin.id}-phone`}>
                <input
                  id={`${admin.id}-phone`}
                  className={inputClass.replace('bg-brand-cream', 'bg-white')}
                  value={admin.phone}
                  onChange={(e) => updateAdmin(admin.id, { phone: e.target.value })}
                />
              </Field>
              <Field label="Email" id={`${admin.id}-email`}>
                <input
                  id={`${admin.id}-email`}
                  type="email"
                  className={inputClass.replace('bg-brand-cream', 'bg-white')}
                  value={admin.email}
                  onChange={(e) => updateAdmin(admin.id, { email: e.target.value })}
                />
              </Field>
              <button
                onClick={() => {
                  removeAdmin(admin.id);
                  logAction('Spa Manager', 'Removed admin user', admin.name);
                }}
                aria-label={`Remove ${admin.name}`}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-red-600 transition-colors hover:bg-red-50"
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
          {admins.length === 0 && <p className="text-sm text-brand-muted">No admin users. Add one so someone can manage the spa.</p>}
        </div>
      </Card>
    </div>
  );
}
