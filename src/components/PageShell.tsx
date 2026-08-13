import type { ReactNode } from 'react';
import { IconRail } from './IconRail';
import { Header } from './Header';

interface PageShellProps {
  title: string;
  subtitle?: string;
  searchPlaceholder?: string;
  onSearch?: (value: string) => void;
  sidePanel?: ReactNode;
  children: ReactNode;
}

export function PageShell({ title, subtitle, searchPlaceholder, onSearch, sidePanel, children }: PageShellProps) {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-brand-cream">
      <IconRail />
      {sidePanel && (
        <aside className="scrollbar-thin flex h-full w-[360px] shrink-0 flex-col overflow-y-auto rounded-r-3xl bg-gradient-to-b from-brand-maroon to-brand-maroon-dark p-5 text-white">
          {sidePanel}
        </aside>
      )}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Header title={title} subtitle={subtitle} searchPlaceholder={searchPlaceholder} onSearch={onSearch} />
        <main className="scrollbar-thin flex-1 overflow-y-auto px-8 pb-8">{children}</main>
      </div>
    </div>
  );
}
