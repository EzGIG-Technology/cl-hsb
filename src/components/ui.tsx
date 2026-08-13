import type { ChangeEvent, ReactNode } from 'react';
import { Camera } from 'lucide-react';
import { useAvatarStore } from '../store/AvatarStore';

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

function initialsOf(name: string) {
  return name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

/** Darkens/mixes a hex color for a subtle two-tone gradient, so placeholder avatars read as a portrait, not a flat chip. */
function shade(hex: string, amt: number) {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.min(255, Math.max(0, (n >> 16) + amt));
  const g = Math.min(255, Math.max(0, ((n >> 8) & 0xff) + amt));
  const b = Math.min(255, Math.max(0, (n & 0xff) + amt));
  return `rgb(${r}, ${g}, ${b})`;
}

export function Avatar({
  name,
  color = '#d94f8c',
  size = 36,
  photoUrl,
}: {
  name: string;
  color?: string;
  size?: number;
  /** Optional uploaded profile picture — falls back to a gradient initials placeholder when absent. */
  photoUrl?: string;
}) {
  if (photoUrl) {
    return (
      <img
        src={photoUrl}
        alt={name}
        className="shrink-0 rounded-full object-cover ring-2 ring-white shadow-sm"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-full font-semibold text-white ring-2 ring-white shadow-sm"
      style={{
        background: `linear-gradient(140deg, ${shade(color, 25)}, ${shade(color, -20)})`,
        width: size,
        height: size,
        fontSize: size * 0.38,
      }}
    >
      {initialsOf(name)}
    </div>
  );
}

/**
 * Avatar wired to the demo-persistent avatar store, with a camera-badge affordance to
 * upload/replace a profile picture. Used for the admin header and CL/mother profile screens.
 */
export function ProfileAvatar({
  avatarKey,
  name,
  color = '#d94f8c',
  size = 64,
  editable = true,
}: {
  avatarKey: string;
  name: string;
  color?: string;
  size?: number;
  editable?: boolean;
}) {
  const { dataUrl, setAvatar } = useAvatarStore(avatarKey);
  const inputId = `avatar-upload-${avatarKey}`;

  function handleUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setAvatar(reader.result as string);
    reader.readAsDataURL(file);
  }

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <Avatar name={name} color={color} size={size} photoUrl={dataUrl} />
      {editable && (
        <label
          htmlFor={inputId}
          className="absolute -bottom-0.5 -right-0.5 flex cursor-pointer items-center justify-center rounded-full border-2 border-white bg-brand-pink text-white shadow-sm hover:bg-brand-pink-dark"
          style={{ width: Math.max(18, size * 0.32), height: Math.max(18, size * 0.32) }}
          title="Upload profile picture"
        >
          <Camera size={Math.max(10, size * 0.18)} />
          <input id={inputId} type="file" accept="image/*" onChange={handleUpload} className="hidden" />
        </label>
      )}
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
