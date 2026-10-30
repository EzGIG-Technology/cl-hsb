import type { ChangeEvent, ReactNode } from 'react';
import { Camera, Baby, Droplets, Footprints, Languages, Home, ShieldPlus, Flower2, Sparkles, Hand, Smile } from 'lucide-react';
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
    <div className={`rounded-2xl bg-white p-5 ${onClick ? 'cursor-pointer transition-colors hover:bg-brand-pink-light/40' : ''} ${className}`} onClick={onClick}>
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
      <div className="mt-3 flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <span className="whitespace-nowrap text-4xl font-semibold tracking-tight text-brand-ink">{value}</span>
        {hint}
      </div>
    </Card>
  );
}

const badgeStyles: Record<string, string> = {
  confirmed: 'bg-brand-lavender-light text-brand-lavender',
  completed: 'bg-brand-lavender-light text-brand-lavender',
  pending: 'bg-brand-amber-light text-brand-amber',
  cancelled: 'bg-red-100 text-red-600',
  urgent: 'bg-red-100 text-red-600',
  upcoming: 'bg-brand-amber-light text-brand-amber',
  active: 'bg-brand-lavender-light text-brand-lavender',
  'on-duty': 'bg-brand-lavender-light text-brand-lavender',
  available: 'bg-blue-100 text-blue-700',
  'on-leave': 'bg-brand-amber-light text-brand-amber',
  'off-duty': 'bg-gray-100 text-gray-500',
  complained: 'bg-brand-amber-light text-brand-amber',
  banned: 'bg-red-100 text-red-600',
  none: 'bg-gray-100 text-gray-500',
  Verified: 'bg-brand-lavender-light text-brand-lavender',
  'In Progress': 'bg-blue-100 text-blue-700',
  'Missing Check-Out Selfie': 'bg-red-100 text-red-600',
  'GPS Mismatch': 'bg-red-100 text-red-600',
  'Pending Approval': 'bg-brand-amber-light text-brand-amber',
  Approved: 'bg-brand-lavender-light text-brand-lavender',
  Rejected: 'bg-red-100 text-red-600',
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

export function Avatar({
  name,
  color = '#c42474',
  size = 36,
  photoUrl,
}: {
  name: string;
  color?: string;
  size?: number;
  /** Optional uploaded profile picture; falls back to flat initials when absent. */
  photoUrl?: string;
}) {
  if (photoUrl) {
    return (
      <img
        src={photoUrl}
        alt={name}
        className="shrink-0 rounded-full object-cover"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-full font-semibold text-white"
      style={{ backgroundColor: color, width: size, height: size, fontSize: size * 0.38 }}
    >
      {initialsOf(name)}
    </div>
  );
}

/**
 * Avatar wired to the demo-persistent avatar store, with a camera-badge affordance to
 * upload/replace a profile picture. Used for the admin header and staff member/customer profile screens.
 */
export function ProfileAvatar({
  avatarKey,
  name,
  color = '#c42474',
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
          className="absolute -bottom-0.5 -right-0.5 flex cursor-pointer items-center justify-center rounded-full bg-brand-pink text-white outline-2 outline-white hover:bg-brand-pink-dark"
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
      <h2 className="text-lg font-semibold tracking-tight text-brand-ink">{children}</h2>
      {action}
    </div>
  );
}

const specialtyIconRules: { keywords: string[]; icon: typeof Flower2 }[] = [
  { keywords: ['prenatal', 'pregnan'], icon: Baby },
  { keywords: ['mandi', 'bath', 'scrub', 'lulur'], icon: Droplets },
  { keywords: ['foot', 'reflexology'], icon: Footprints },
  { keywords: ['totok', 'facial', 'face'], icon: Smile },
  { keywords: ['back', 'deep tissue', 'urut', 'traditional'], icon: Hand },
  { keywords: ['first aid', 'cpr'], icon: ShieldPlus },
  { keywords: ['home service', 'home visit'], icon: Home },
  { keywords: ['english', 'mandarin', 'tamil', 'speaking'], icon: Languages },
  { keywords: ['massage', 'therapy', 'aroma'], icon: Flower2 },
];

function specialtyIcon(label: string) {
  const lower = label.toLowerCase();
  return specialtyIconRules.find((r) => r.keywords.some((k) => lower.includes(k)))?.icon ?? Sparkles;
}

/** Icon-tagged pill for a staff member specialty/skill — keyword-matched so no per-specialty authoring is needed as new ones are added. */
export function SpecialtyChip({ label }: { label: string }) {
  const Icon = specialtyIcon(label);
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-brand-pink-light px-2.5 py-1 text-xs text-brand-pink">
      <Icon size={11} /> {label}
    </span>
  );
}
