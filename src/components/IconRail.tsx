import { NavLink } from 'react-router-dom';
import {
  LayoutGrid,
  Smartphone,
  Users,
  MapPin,
  CalendarClock,
  BarChart3,
  Contact,
  MessageCircle,
  Settings,
  LogOut,
} from 'lucide-react';
import { Logo } from './Logo';

const navItems = [
  { to: '/', icon: LayoutGrid, label: 'Overview' },
  { to: '/mobile-app', icon: Smartphone, label: 'Mobile app' },
  { to: '/cls', icon: Users, label: 'Confinement Ladies' },
  { to: '/map', icon: MapPin, label: 'Operations map' },
  { to: '/schedule', icon: CalendarClock, label: 'Schedule & Roster' },
  { to: '/reports', icon: BarChart3, label: 'Reports' },
  { to: '/clients', icon: Contact, label: 'Clients' },
  { to: '/messages', icon: MessageCircle, label: 'Messages' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export function IconRail() {
  return (
    <nav className="flex h-full w-16 flex-col items-center gap-1 bg-brand-maroon-dark py-4">
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-white p-1 shadow-sm">
        <Logo variant="icon" size={34} />
      </div>

      <div className="flex flex-1 flex-col items-center gap-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            title={label}
            className={({ isActive }) =>
              `group relative flex h-11 w-11 items-center justify-center rounded-xl transition-colors ${
                isActive ? 'bg-white text-brand-maroon-dark' : 'text-white/60 hover:bg-white/10 hover:text-white'
              }`
            }
          >
            <Icon size={20} strokeWidth={2} />
          </NavLink>
        ))}
      </div>

      <button
        title="Log out (demo)"
        className="flex h-11 w-11 items-center justify-center rounded-xl text-white/50 transition-colors hover:bg-white/10 hover:text-white"
      >
        <LogOut size={20} />
      </button>
    </nav>
  );
}
