import { NavLink, Link } from 'react-router-dom';
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
  Sparkles,
  CalendarDays,
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
  accent: string;
  items: NavItem[];
}

const groups: NavGroup[] = [
  {
    label: 'Operations',
    accent: 'bg-brand-pink',
    items: [
      { to: '/', label: 'Overview / Live Monitor', icon: Diamond },
      { to: '/bookings', label: 'Bookings & Assignment', icon: ClipboardList, badgeColor: 'bg-brand-pink' },
      { to: '/schedule', label: 'Schedule & Roster', icon: CalendarDays },
      { to: '/cls', label: 'Caregiver (CL) Directory', icon: Users },
      { to: '/clients', label: 'Customer Directory', icon: Contact },
      { to: '/visits', label: 'Visit Records & Audit', icon: ShieldCheck },
    ],
  },
  {
    label: 'Finance & Risk',
    accent: 'bg-brand-amber',
    items: [
      { to: '/payroll', label: 'Hourly Payroll', icon: Clock },
      { to: '/disputes', label: 'Disputes & Exceptions', icon: AlertTriangle, badgeColor: 'bg-red-500' },
    ],
  },
  {
    label: 'Catalog',
    accent: 'bg-sky-400',
    items: [{ to: '/packages', label: 'Packages & Availability', icon: Package }],
  },
  {
    label: 'System',
    accent: 'bg-brand-green',
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
    <aside className="flex h-full w-64 shrink-0 flex-col bg-brand-green-dark text-white">
      <div className="flex items-center gap-3 px-5 py-4">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-white p-1 shadow-sm">
          {company.logoDataUrl ? (
            <img src={company.logoDataUrl} alt="NR Mothercare Confinement" className="h-full w-full object-contain" />
          ) : (
            <Logo size={56} className="h-full w-full" />
          )}
        </div>
        <p className="text-[10px] font-semibold leading-tight tracking-wide text-white/50">
          NR MOTHERCARE
          <br />
          CONFINEMENT OPS
        </p>
      </div>

      <nav className="scrollbar-thin flex-1 overflow-y-auto px-3 pb-4">
        {groups.map((group) => (
          <div key={group.label} className="mb-5">
            <p className="mb-2 flex items-center gap-2 px-3 text-[10px] font-bold uppercase tracking-wider text-white/40">
              <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${group.accent}`} />
              {group.label}
            </p>
            <div className="flex flex-col gap-0.5">
              {group.items.map((item) => {
                const badge = badgeCounts[item.to];
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === '/'}
                    className={({ isActive }) =>
                      `flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm transition-colors ${
                        isActive ? 'bg-white font-medium text-brand-green-dark shadow-sm' : 'text-white/70 hover:bg-white/10 hover:text-white'
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

      <div className="p-3">
        <Link
          to="/reports"
          className="relative block overflow-hidden rounded-2xl bg-gradient-to-br from-brand-pink to-brand-pink-dark p-4 shadow-lg transition-transform hover:scale-[1.02]"
        >
          <div className="absolute -right-4 -top-6 h-20 w-20 rounded-full bg-white/10" />
          <div className="absolute -bottom-6 left-4 h-16 w-16 rounded-full bg-white/10" />
          <Sparkles size={20} className="relative text-white" />
          <p className="relative mt-2 text-sm font-semibold text-white">Business Insights</p>
          <p className="relative mt-1 text-[11px] leading-snug text-white/80">
            See revenue, ratings, and leaderboard trends in one view.
          </p>
          <span className="relative mt-3 inline-block rounded-full bg-white px-3 py-1.5 text-[11px] font-semibold text-brand-pink">
            View Reports
          </span>
        </Link>
      </div>
    </aside>
  );
}
