import type { ChangeEvent, ReactNode } from 'react';
import { Camera, ChefHat, Baby, Droplets, Milk, Footprints, Plane, Languages, Home, Shirt, ShieldPlus, Flower2, Sparkles } from 'lucide-react';
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
  Verified: 'bg-brand-green-light text-brand-green',
  'In Progress': 'bg-blue-100 text-blue-700',
  'Missing Check-Out Selfie': 'bg-red-100 text-red-600',
  'GPS Mismatch': 'bg-red-100 text-red-600',
  'Pending Approval': 'bg-brand-amber-light text-brand-amber',
  Approved: 'bg-brand-green-light text-brand-green',
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

/** Darkens/mixes a hex color for a subtle two-tone gradient, so placeholder avatars read as a portrait, not a flat chip. */
function shade(hex: string, amt: number) {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.min(255, Math.max(0, (n >> 16) + amt));
  const g = Math.min(255, Math.max(0, ((n >> 8) & 0xff) + amt));
  const b = Math.min(255, Math.max(0, (n & 0xff) + amt));
  return `rgb(${r}, ${g}, ${b})`;
}

/** Small deterministic hash so a person's placeholder pattern/variant stays stable across renders. */
function hashOf(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h += s.charCodeAt(i);
  return h;
}

const AVATAR_PATTERNS = ['arcs', 'diagonals', 'dots'] as const;

/** Subtle geometric texture layered under the initials — purely procedural, never an attempt at a photorealistic face. */
function AvatarPattern({ pattern }: { pattern: (typeof AVATAR_PATTERNS)[number] }) {
  const common = { viewBox: '0 0 100 100', className: 'absolute inset-0 h-full w-full', style: { opacity: 0.16 } };
  if (pattern === 'arcs') {
    return (
      <svg {...common}>
        <circle cx="100" cy="0" r="28" fill="none" stroke="white" strokeWidth="7" />
        <circle cx="100" cy="0" r="48" fill="none" stroke="white" strokeWidth="7" />
        <circle cx="100" cy="0" r="68" fill="none" stroke="white" strokeWidth="7" />
      </svg>
    );
  }
  if (pattern === 'diagonals') {
    return (
      <svg {...common}>
        {[-20, 10, 40, 70, 100, 130].map((x) => (
          <line key={x} x1={x} y1="0" x2={x - 45} y2="100" stroke="white" strokeWidth="7" />
        ))}
      </svg>
    );
  }
  return (
    <svg {...common}>
      {[18, 42, 66, 90].flatMap((cy) => [18, 42, 66, 90].map((cx) => <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="4.5" fill="white" />))}
    </svg>
  );
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
  const pattern = AVATAR_PATTERNS[hashOf(name) % AVATAR_PATTERNS.length];
  return (
    <div
      className="relative flex shrink-0 items-center justify-center overflow-hidden rounded-full font-semibold text-white ring-2 ring-white"
      style={{
        background: `linear-gradient(140deg, ${shade(color, 25)}, ${shade(color, -20)})`,
        width: size,
        height: size,
        fontSize: size * 0.38,
        boxShadow: `0 2px 8px ${color}55`,
      }}
    >
      <AvatarPattern pattern={pattern} />
      <span className="relative">{initialsOf(name)}</span>
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

const specialtyIconRules: { keywords: string[]; icon: typeof ChefHat }[] = [
  { keywords: ['cook'], icon: ChefHat },
  { keywords: ['baby'], icon: Baby },
  { keywords: ['herbal', 'bath', 'tangas', 'sauna'], icon: Droplets },
  { keywords: ['lactation'], icon: Milk },
  { keywords: ['reflexology'], icon: Footprints },
  { keywords: ['first aid', 'cpr'], icon: ShieldPlus },
  { keywords: ['stay-in', 'full-day'], icon: Home },
  { keywords: ['overseas'], icon: Plane },
  { keywords: ['english', 'mandarin', 'tamil', 'speaking'], icon: Languages },
  { keywords: ['bengkung'], icon: Shirt },
  { keywords: ['massage', 'therapy'], icon: Flower2 },
];

function specialtyIcon(label: string) {
  const lower = label.toLowerCase();
  return specialtyIconRules.find((r) => r.keywords.some((k) => lower.includes(k)))?.icon ?? Sparkles;
}

/** Icon-tagged pill for a CL specialty/skill — keyword-matched so no per-specialty authoring is needed as new ones are added. */
export function SpecialtyChip({ label }: { label: string }) {
  const Icon = specialtyIcon(label);
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-brand-pink-light px-2.5 py-1 text-xs text-brand-pink">
      <Icon size={11} /> {label}
    </span>
  );
}
