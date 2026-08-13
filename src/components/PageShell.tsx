import type { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';

interface PageShellProps {
  title: string;
  subtitle?: string;
  searchPlaceholder?: string;
  onSearch?: (value: string) => void;
  headerAction?: ReactNode;
  children: ReactNode;
}

export function PageShell({ title, subtitle, searchPlaceholder, onSearch, headerAction, children }: PageShellProps) {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-brand-cream">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <TopBar searchPlaceholder={searchPlaceholder} onSearch={onSearch} />
        <main className="scrollbar-thin flex-1 overflow-y-auto px-6 py-6">
          <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-semibold text-brand-ink">{title}</h1>
              {subtitle && <p className="mt-1 text-sm text-brand-muted">{subtitle}</p>}
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
    <div className={`rounded-2xl border border-black/5 bg-white p-4 shadow-sm ${className}`}>
      {title && <h3 className="mb-3 text-sm font-semibold text-brand-ink">{title}</h3>}
      {children}
    </div>
  );
}
