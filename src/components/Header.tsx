import { Bell, Search, ChevronDown } from 'lucide-react';

interface HeaderProps {
  title: string;
  subtitle?: string;
  searchPlaceholder?: string;
  onSearch?: (value: string) => void;
}

export function Header({ title, subtitle, searchPlaceholder = 'Search', onSearch }: HeaderProps) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4 px-8 pt-8 pb-2">
      <div>
        <h1 className="text-3xl font-semibold text-brand-ink">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-brand-muted">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-3">
        <div className="relative">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            onChange={(e) => onSearch?.(e.target.value)}
            className="w-56 rounded-full border border-black/10 bg-white py-2 pl-9 pr-3 text-sm text-brand-ink placeholder:text-brand-muted focus:outline-none focus:ring-2 focus:ring-brand-pink"
          />
        </div>

        <button className="flex items-center gap-1 rounded-full border border-black/10 bg-white px-3 py-2 text-sm text-brand-ink">
          English
          <ChevronDown size={14} />
        </button>

        <button className="relative flex h-9 w-9 items-center justify-center rounded-full border border-black/10 bg-white text-brand-ink">
          <Bell size={16} />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-brand-pink" />
        </button>

        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-maroon text-sm font-semibold text-white">
          A
        </div>
      </div>
    </div>
  );
}
