import { NavLink } from 'react-router-dom';
import {
  Diamond,
  ClipboardList,
  Users,
  Contact,
  ShieldCheck,
  Clock,
  AlertTriangle,
  Package,
  Settings,
  Smartphone,
  BarChart3,
  MessageCircle,
} from 'lucide-react';
import { Logo } from './Logo';
import { useSettings } from '../store/SettingsContext';
import { useAssignmentStore } from '../store/AssignmentStore';
import { disputes } from '../data/disputes';

interface NavItem {
  to: string;
  label: string;
  icon: typeof Diamond;
  badgeColor?: string;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const groups: NavGroup[] = [
  {
    label: 'Operations',
    items: [
      { to: '/', label: 'Overview / Live Monitor', icon: Diamond },
      { to: '/bookings', label: 'Bookings & Assignment', icon: ClipboardList, badgeColor: 'bg-brand-pink' },
      { to: '/cls', label: 'Caregiver (CL) Directory', icon: Users },
      { to: '/clients', label: 'Customer Directory', icon: Contact },
      { to: '/visits', label: 'Visit Records & Audit', icon: ShieldCheck },
    ],
  },
  {
    label: 'Finance & Risk',
    items: [
      { to: '/payroll', label: 'Hourly Payroll', icon: Clock },
      { to: '/disputes', label: 'Disputes & Exceptions', icon: AlertTriangle, badgeColor: 'bg-red-500' },
    ],
  },
  {
    label: 'Catalog',
    items: [{ to: '/packages', label: 'Packages & Availability', icon: Package }],
  },
  {
    label: 'System',
    items: [
      { to: '/reports', label: 'Reports & Analytics', icon: BarChart3 },
      { to: '/messages', label: 'Messages', icon: MessageCircle },
      { to: '/settings', label: 'Settings & Users', icon: Settings },
      { to: '/mobile-app', label: 'Mobile App Preview', icon: Smartphone },
    ],
  },
];

export function Sidebar() {
  const { company } = useSettings();
  const { unassignedClientIds } = useAssignmentStore();
  const openDisputes = disputes.filter((d) => d.status === 'Open').length;

  const badgeCounts: Record<string, number> = {
    '/bookings': unassignedClientIds.length,
    '/disputes': openDisputes,
  };

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-black/5 bg-white">
      <div className="flex items-center gap-2.5 px-5 py-5">
        {company.logoDataUrl ? (
          <img src={company.logoDataUrl} alt="" className="h-8 w-8 rounded-lg object-contain" />
        ) : (
          <Logo variant="icon" size={32} />
        )}
        <div>
          <p className="text-sm font-bold leading-tight text-brand-ink">NR Mothercare</p>
          <p className="text-[10px] font-medium tracking-wide text-brand-muted">CONFINEMENT OPS</p>
        </div>
      </div>

      <nav className="scrollbar-thin flex-1 overflow-y-auto px-3 pb-4">
        {groups.map((group) => (
          <div key={group.label} className="mb-4">
            <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-wide text-brand-muted">{group.label}</p>
            <div className="flex flex-col gap-0.5">
              {group.items.map((item) => {
                const badge = badgeCounts[item.to];
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === '/'}
                    className={({ isActive }) =>
                      `flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${
                        isActive ? 'bg-brand-pink-light font-medium text-brand-pink-dark' : 'text-brand-ink/80 hover:bg-brand-cream'
                      }`
                    }
                  >
                    <item.icon size={16} className="shrink-0" />
                    <span className="flex-1 truncate">{item.label}</span>
                    {badge ? (
                      <span className={`flex h-4 min-w-4 shrink-0 items-center justify-center rounded-full px-1 text-[10px] font-semibold text-white ${item.badgeColor}`}>
                        {badge}
                      </span>
                    ) : null}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}
