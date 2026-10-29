import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';

interface PageShellProps {
  title: string;
  subtitle?: string;
  /** Kept for call-site compatibility; the module icon now lives only in the Sidebar. */
  icon?: LucideIcon;
  accentColor?: string;
  searchPlaceholder?: string;
  onSearch?: (value: string) => void;
  headerAction?: ReactNode;
  children: ReactNode;
}

export function PageShell({ title, subtitle, searchPlaceholder, onSearch, headerAction, children }: PageShellProps) {
  return (
    <div className="flex h-dvh w-screen overflow-hidden bg-brand-cream">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <TopBar searchPlaceholder={searchPlaceholder} onSearch={onSearch} />
        <main className="scrollbar-thin flex-1 overflow-y-auto px-8 pb-10 pt-8">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-3xl">
              <h1 className="text-4xl font-semibold leading-none tracking-tight text-brand-ink">{title}</h1>
              {subtitle && <p className="mt-3 text-base text-brand-muted">{subtitle}</p>}
            </div>
            {headerAction}
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}

export function SidePanelCard({ title, children, className = '' }: { title?: string; children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl bg-white p-5 ${className}`}>
      {title && <h3 className="mb-3 text-base font-semibold text-brand-ink">{title}</h3>}
      {children}
    </div>
  );
}
