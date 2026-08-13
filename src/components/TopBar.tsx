import { Search } from 'lucide-react';
import { ProfileAvatar } from './ui';

interface TopBarProps {
  searchPlaceholder?: string;
  onSearch?: (value: string) => void;
}

export function TopBar({ searchPlaceholder = 'Search caregiver, booking ID, customer, or postcode…', onSearch }: TopBarProps) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-black/5 bg-white px-6 py-3">
      <div className="relative max-w-md flex-1">
        <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" />
        <input
          type="text"
          placeholder={searchPlaceholder}
          onChange={(e) => onSearch?.(e.target.value)}
          className="w-full rounded-full border border-black/10 bg-brand-cream py-2 pl-9 pr-3 text-sm text-brand-ink placeholder:text-brand-muted focus:outline-none focus:ring-2 focus:ring-brand-pink"
        />
      </div>

      <div className="flex items-center gap-4">
        <span className="flex items-center gap-1.5 rounded-full bg-brand-green-light px-3 py-1.5 text-xs font-semibold text-brand-green">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand-green" /> Live Sync
        </span>
        <div className="flex items-center gap-2">
          <ProfileAvatar avatarKey="admin" name="Superadmin" size={34} />
          <div className="hidden sm:block">
            <p className="text-xs font-medium leading-tight text-brand-ink">Superadmin</p>
            <p className="text-[10px] leading-tight text-brand-muted">Admin</p>
          </div>
        </div>
      </div>
    </div>
  );
}
