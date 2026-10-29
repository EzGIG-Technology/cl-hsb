import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ClipboardList,
  Users,
  Contact,
  ShieldCheck,
  Clock,
  AlertTriangle,
  Flower2,
  Settings,
  Smartphone,
  BarChart3,
  MessageCircle,
  CalendarDays,
} from 'lucide-react';
import { Logo } from './Logo';
import { useSettings } from '../store/SettingsContext';
import { useAssignmentStore } from '../store/AssignmentStore';
import { useDisputeStore } from '../store/DisputeStore';
import { useOpenStatus } from '../lib/hours';

interface NavItem {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const groups: NavGroup[] = [
  {
    label: 'Today',
    items: [
      { to: '/', label: 'Overview', icon: LayoutDashboard },
      { to: '/bookings', label: 'Bookings', icon: ClipboardList },
      { to: '/schedule', label: 'Schedule & roster', icon: CalendarDays },
      { to: '/visits', label: 'Session records', icon: ShieldCheck },
    ],
  },
  {
    label: 'People',
    items: [
      { to: '/cls', label: 'Therapists', icon: Users },
      { to: '/clients', label: 'Clients', icon: Contact },
      { to: '/messages', label: 'Messages', icon: MessageCircle },
    ],
  },
  {
    label: 'Menu & money',
    items: [
      { to: '/packages', label: 'Treatments & prices', icon: Flower2 },
      { to: '/payroll', label: 'Payroll', icon: Clock },
      { to: '/disputes', label: 'Complaints', icon: AlertTriangle },
      { to: '/reports', label: 'Reports', icon: BarChart3 },
    ],
  },
  {
    label: 'System',
    items: [
      { to: '/settings', label: 'Settings & users', icon: Settings },
      { to: '/mobile-app', label: 'Mobile app preview', icon: Smartphone },
    ],
  },
];

export function Sidebar() {
  const { company } = useSettings();
  const { unassignedClientIds } = useAssignmentStore();
  const { disputes } = useDisputeStore();
  const status = useOpenStatus();
  const openDisputes = disputes.filter((d) => d.status === 'Open').length;

  const badgeCounts: Record<string, number> = {
    '/bookings': unassignedClientIds.length,
    '/disputes': openDisputes,
  };

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col bg-white">
      <div className="px-5 pb-4 pt-6">
        {company.logoDataUrl ? (
          <img src={company.logoDataUrl} alt={company.name} className="h-14 w-auto object-contain" />
        ) : (
          <Logo size={56} className="-ml-1" />
        )}
      </div>

      <nav className="scrollbar-thin flex-1 overflow-y-auto px-3 pb-4" aria-label="Main">
        {groups.map((group) => (
          <div key={group.label} className="mb-5">
            <p className="mb-1 px-3 text-sm text-brand-muted">{group.label}</p>
            <div className="flex flex-col gap-0.5">
              {group.items.map((item) => {
                const badge = badgeCounts[item.to];
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === '/'}
                    className={({ isActive }) =>
                      `group flex items-center gap-3 rounded-full px-3 py-2 text-[15px] transition-colors ${
                        isActive ? 'bg-brand-pink font-medium text-white' : 'text-brand-ink hover:bg-brand-pink-light'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <item.icon size={17} className={`shrink-0 ${isActive ? 'text-white' : 'text-brand-lavender'}`} />
                        <span className="flex-1 truncate">{item.label}</span>
                        {badge ? (
                          <span
                            className={`flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full px-1.5 text-xs font-semibold ${
                              isActive ? 'bg-white text-brand-pink' : 'bg-brand-pink-light text-brand-pink'
                            }`}
                          >
                            {badge}
                          </span>
                        ) : null}
                      </>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="m-3 rounded-2xl bg-brand-lavender-light p-4">
        <p className="flex items-center gap-2 text-sm font-medium text-brand-ink">
          <span className={`h-2 w-2 shrink-0 rounded-full ${status.open ? 'bg-emerald-500' : 'bg-brand-muted'}`} />
          {status.open ? 'Open now' : 'Closed'}
        </p>
        <p className="mt-1 text-sm leading-snug text-brand-muted">{status.label.split(' · ')[1]}</p>
        <p className="mt-2 text-sm leading-snug text-brand-ink">Bangi Sentral · {company.phone}</p>
      </div>
    </aside>
  );
}
