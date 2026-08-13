import { useState } from 'react';
import { Bell, Search, ChevronDown, Globe } from 'lucide-react';
import { useActivityLog, timeAgo } from '../store/ActivityLogContext';
import { useSettings } from '../store/SettingsContext';

interface HeaderProps {
  title: string;
  subtitle?: string;
  searchPlaceholder?: string;
  onSearch?: (value: string) => void;
}

const LANGUAGES = ['English', 'Bahasa Melayu', 'Bahasa Indonesia'];

export function Header({ title, subtitle, searchPlaceholder = 'Search', onSearch }: HeaderProps) {
  const { entries } = useActivityLog();
  const { company } = useSettings();
  const [langOpen, setLangOpen] = useState(false);
  const [language, setLanguage] = useState('English');
  const [notifOpen, setNotifOpen] = useState(false);

  return (
    <div className="flex flex-wrap items-start justify-between gap-4 px-8 pt-8 pb-2">
      <div className="flex items-center gap-3">
        {company.logoDataUrl && (
          <img src={company.logoDataUrl} alt="Company logo" className="h-10 w-10 rounded-lg object-contain" />
        )}
        <div>
          <h1 className="text-3xl font-semibold text-brand-ink">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-brand-muted">{subtitle}</p>}
        </div>
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

        <div className="relative">
          <button
            onClick={() => {
              setLangOpen((v) => !v);
              setNotifOpen(false);
            }}
            className="flex items-center gap-1.5 rounded-full border border-black/10 bg-white px-3 py-2 text-sm text-brand-ink"
          >
            <Globe size={14} />
            {language}
            <ChevronDown size={14} />
          </button>
          {langOpen && (
            <div className="absolute right-0 top-11 z-20 w-44 overflow-hidden rounded-xl border border-black/5 bg-white shadow-lg">
              {LANGUAGES.map((l) => (
                <button
                  key={l}
                  onClick={() => {
                    setLanguage(l);
                    setLangOpen(false);
                  }}
                  className={`block w-full px-3 py-2 text-left text-sm hover:bg-brand-cream ${l === language ? 'font-semibold text-brand-pink' : 'text-brand-ink'}`}
                >
                  {l}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="relative">
          <button
            onClick={() => {
              setNotifOpen((v) => !v);
              setLangOpen(false);
            }}
            className="relative flex h-9 w-9 items-center justify-center rounded-full border border-black/10 bg-white text-brand-ink"
          >
            <Bell size={16} />
            {entries.length > 0 && <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-brand-pink" />}
          </button>
          {notifOpen && (
            <div className="absolute right-0 top-11 z-20 w-80 overflow-hidden rounded-xl border border-black/5 bg-white shadow-lg">
              <div className="border-b border-black/5 px-4 py-2.5 text-sm font-semibold text-brand-ink">Recent activity</div>
              <div className="scrollbar-thin max-h-80 overflow-y-auto">
                {entries.length === 0 && <p className="px-4 py-3 text-sm text-brand-muted">No activity yet.</p>}
                {entries.slice(0, 8).map((e) => (
                  <div key={e.id} className="border-b border-black/5 px-4 py-2.5 last:border-b-0">
                    <p className="text-sm text-brand-ink">
                      <span className="font-medium">{e.adminName}</span> {e.action.toLowerCase()}
                    </p>
                    {e.details && <p className="text-xs text-brand-muted">{e.details}</p>}
                    <p className="mt-0.5 text-[10px] text-brand-muted">{timeAgo(e.time)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-pink text-sm font-semibold text-white">
          A
        </div>
      </div>
    </div>
  );
}
