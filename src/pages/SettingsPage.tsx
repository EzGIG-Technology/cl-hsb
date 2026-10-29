import { useState, type ChangeEvent } from 'react';
import { Plus, Trash2, RotateCcw } from 'lucide-react';
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
  'w-full rounded-lg border border-black/10 px-3 py-2 text-sm text-brand-ink focus:outline-none focus:ring-2 focus:ring-brand-pink';
const labelClass = 'mb-1 block text-xs font-medium text-brand-muted';

export default function SettingsPage() {
  const [section, setSection] = useState<Section>('company');
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
  }

  return (
    <PageShell
      title="Settings & Users"
      subtitle="Company profile and admin access."
      headerAction={
        <button
          onClick={resetEverything}
          className="flex items-center gap-1.5 rounded-full border border-black/10 px-3 py-1.5 text-xs font-medium text-brand-ink hover:bg-brand-cream"
        >
          <RotateCcw size={12} /> Reset all demo data
        </button>
      }
    >
      <div className="mb-5 flex flex-wrap gap-2">
        {sections.map((s) => (
          <button
            key={s.id}
            onClick={() => setSection(s.id)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              section === s.id ? 'bg-brand-pink text-white' : 'border border-black/10 bg-white text-brand-ink hover:bg-brand-cream'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>
      <div>
        {section === 'company' && <CompanySettings />}
        {section === 'team' && <TeamSettings />}
      </div>
      <div className="h-6" />
    </PageShell>
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
      logAction('Front Desk', 'Updated company logo', file.name);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  }

  return (
    <Card className="max-w-2xl">
      <SectionTitle>Company profile</SectionTitle>

      <div className="mb-5 flex items-center gap-4 rounded-xl border border-dashed border-black/15 p-4">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-brand-cream">
          {company.logoDataUrl ? (
            <img src={company.logoDataUrl} alt="Company logo" className="h-full w-full object-contain" />
          ) : (
            <Logo variant="icon" size={44} />
          )}
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-brand-ink">Company logo</p>
          <p className="text-xs text-brand-muted">Upload a PNG or SVG — it'll replace the placeholder logo across the dashboard.</p>
          <div className="mt-2 flex gap-2">
            <label className="cursor-pointer rounded-full bg-brand-pink px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-pink-dark">
              Upload logo
              <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
            </label>
            {company.logoDataUrl && (
              <button
                onClick={() => {
                  updateCompany({ logoDataUrl: undefined });
                  logAction('Front Desk', 'Removed company logo');
                }}
                className="rounded-full border border-black/10 px-3 py-1.5 text-xs text-brand-ink hover:bg-brand-cream"
              >
                Remove
              </button>
            )}
          </div>
        </div>
      </div>

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
          <label className={labelClass}>Phone</label>
          <input className={inputClass} value={company.phone} onChange={(e) => updateCompany({ phone: e.target.value })} />
        </div>
        <div>
          <label className={labelClass}>WhatsApp bookings</label>
          <input className={inputClass} value={company.whatsapp} onChange={(e) => updateCompany({ whatsapp: e.target.value })} />
        </div>
        <div>
          <label className={labelClass}>Opening hours</label>
          <input className={inputClass} value={company.hours} onChange={(e) => updateCompany({ hours: e.target.value })} />
        </div>
        <div>
          <label className={labelClass}>Instagram</label>
          <input className={inputClass} value={company.instagram} onChange={(e) => updateCompany({ instagram: e.target.value })} />
        </div>
        <div>
          <label className={labelClass}>Facebook</label>
          <input className={inputClass} value={company.facebook} onChange={(e) => updateCompany({ facebook: e.target.value })} />
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
  const { logAction } = useActivityLog();

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <SectionTitle>{admins.length} admin users</SectionTitle>
        <button
          onClick={() => {
            addAdmin();
            logAction('Front Desk', 'Added a new admin user');
          }}
          className="flex items-center gap-1.5 rounded-full bg-brand-pink px-3 py-1.5 text-sm text-white hover:bg-brand-pink-dark"
        >
          <Plus size={14} /> Add admin
        </button>
      </div>

      <div className="mb-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
        <div className="rounded-xl bg-brand-cream p-3 text-xs text-brand-muted">
          <p className="font-semibold text-brand-ink">Admin</p>
          Full access — bookings, CLs, packages, settings.
        </div>
        <div className="rounded-xl bg-brand-cream p-3 text-xs text-brand-muted">
          <p className="font-semibold text-brand-ink">Operations</p>
          Bookings, scheduling, and CL assignment — no financial data.
        </div>
        <div className="rounded-xl bg-brand-cream p-3 text-xs text-brand-muted">
          <p className="font-semibold text-brand-ink">Finance</p>
          Revenue, payment status, and payouts only — no booking/CL controls.
        </div>
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
                <select className={inputClass} value={admin.role} onChange={(e) => updateAdmin(admin.id, { role: e.target.value })}>
                  {ADMIN_ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
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
                  onClick={() => {
                    removeAdmin(admin.id);
                    logAction('Front Desk', 'Removed admin user', admin.name);
                  }}
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
