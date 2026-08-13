import type { ReactNode } from 'react';

export function Card({
  children,
  className = '',
  onClick,
}: {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <div className={`rounded-2xl border border-black/5 bg-white p-5 shadow-sm ${className}`} onClick={onClick}>
      {children}
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  icon?: ReactNode;
  className?: string;
}

export function StatCard({ label, value, hint, icon, className = '' }: StatCardProps) {
  return (
    <Card className={className}>
      <div className="flex items-center justify-between text-sm text-brand-muted">
        <span>{label}</span>
        {icon}
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-3xl font-semibold text-brand-ink">{value}</span>
        {hint}
      </div>
    </Card>
  );
}

const badgeStyles: Record<string, string> = {
  confirmed: 'bg-brand-green-light text-brand-green',
  completed: 'bg-brand-green-light text-brand-green',
  pending: 'bg-brand-amber-light text-brand-amber',
  cancelled: 'bg-red-100 text-red-600',
  urgent: 'bg-red-100 text-red-600',
  upcoming: 'bg-brand-amber-light text-brand-amber',
  active: 'bg-brand-green-light text-brand-green',
  'on-duty': 'bg-brand-green-light text-brand-green',
  available: 'bg-blue-100 text-blue-700',
  'on-leave': 'bg-brand-amber-light text-brand-amber',
  'off-duty': 'bg-gray-100 text-gray-500',
  complained: 'bg-brand-amber-light text-brand-amber',
  banned: 'bg-red-100 text-red-600',
  none: 'bg-gray-100 text-gray-500',
};

export function Badge({ status, children }: { status: string; children: ReactNode }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${badgeStyles[status] ?? 'bg-gray-100 text-gray-600'}`}>
      {children}
    </span>
  );
}

export function Avatar({ name, color = '#d94f8c', size = 36 }: { name: string; color?: string; size?: number }) {
  const initials = name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-full font-semibold text-white"
      style={{ backgroundColor: color, width: size, height: size, fontSize: size * 0.38 }}
    >
      {initials}
    </div>
  );
}

export function formatRM(amount: number) {
  return `RM ${amount.toLocaleString('en-MY')}`;
}

export function SectionTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <h2 className="text-lg font-semibold text-brand-ink">{children}</h2>
      {action}
    </div>
  );
}
