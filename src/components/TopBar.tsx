import { Search } from 'lucide-react';
import { ProfileAvatar } from './ui';

interface TopBarProps {
  searchPlaceholder?: string;
  onSearch?: (value: string) => void;
}

export function TopBar({ searchPlaceholder = 'Search therapist, booking ID or client…', onSearch }: TopBarProps) {
  return (
    <div className="flex items-center justify-between gap-4 bg-white px-8 py-3">
      <div className="relative max-w-md flex-1">
        <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-muted" />
        <input
          type="text"
          placeholder={searchPlaceholder}
          aria-label="Search"
          onChange={(e) => onSearch?.(e.target.value)}
          className="w-full rounded-full bg-brand-cream py-2.5 pl-10 pr-4 text-sm text-brand-ink placeholder:text-brand-muted focus:outline-none focus:ring-2 focus:ring-brand-pink"
        />
      </div>

      <div className="flex items-center gap-3">
        <ProfileAvatar avatarKey="admin" name="Front Desk" size={36} color="#6f76b0" />
        <div className="hidden sm:block">
          <p className="text-sm font-medium leading-tight text-brand-ink">Front Desk</p>
          <p className="text-xs leading-tight text-brand-muted">Superadmin</p>
        </div>
      </div>
    </div>
  );
}
