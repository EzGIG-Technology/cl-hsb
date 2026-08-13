import { Sparkles, TrendingUp, Star, MapPin, Heart } from 'lucide-react';
import { ProfileAvatar } from './ui';

/**
 * Decorative welcome banner for the Overview page — an all-CSS/SVG "isometric desk"
 * illustration (no image assets available), in the spirit of a product dashboard hero.
 */
export function HeroBanner({ name, dateLabel }: { name: string; dateLabel: string }) {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-green-dark via-brand-green to-brand-green-dark px-6 py-7 text-white sm:px-8">
      <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-white/10" />
      <div className="pointer-events-none absolute -bottom-24 left-1/3 h-56 w-56 rounded-full bg-white/5" />
      <div className="pointer-events-none absolute right-24 top-6 h-16 w-16 rounded-full bg-brand-pink/30 blur-xl" />

      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-4">
          <ProfileAvatar avatarKey="admin" name={name} size={56} />
          <div>
            <p className="flex items-center gap-1.5 text-xs font-medium text-white/70">
              <Sparkles size={13} /> {dateLabel}
            </p>
            <h2 className="mt-1 text-2xl font-semibold">Hello, {name.split(' ')[0]} 👋</h2>
            <p className="mt-1 max-w-sm text-sm text-white/75">
              Here's how confinement care is running across all branches today.
            </p>
          </div>
        </div>

        {/* Decorative isometric-style illustration built from CSS shapes */}
        <div className="relative hidden h-32 w-72 shrink-0 sm:block">
          <div className="absolute bottom-0 left-6 h-3 w-56 rounded-full bg-black/10 blur-sm" />
          {/* desk */}
          <div className="absolute bottom-3 left-8 h-16 w-48 rounded-2xl bg-white/15 backdrop-blur-sm ring-1 ring-white/20" />
          {/* monitor */}
          <div className="absolute bottom-16 left-16 h-14 w-24 rounded-lg bg-white/90 shadow-lg">
            <div className="m-1.5 h-9 rounded bg-gradient-to-br from-brand-pink-light to-brand-green-light" />
          </div>
          {/* floating stat chip */}
          <div className="absolute -top-1 right-0 flex items-center gap-1.5 rounded-xl bg-white px-3 py-2 text-brand-ink shadow-lg">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-green-light text-brand-green">
              <TrendingUp size={13} />
            </div>
            <div className="leading-tight">
              <p className="text-[13px] font-semibold">+18%</p>
              <p className="text-[9px] text-brand-muted">bookings</p>
            </div>
          </div>
          {/* floating rating chip */}
          <div className="absolute bottom-0 right-4 flex items-center gap-1.5 rounded-xl bg-white px-3 py-2 text-brand-ink shadow-lg">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-amber-light text-brand-amber">
              <Star size={12} className="fill-brand-amber" />
            </div>
            <div className="leading-tight">
              <p className="text-[13px] font-semibold">4.6</p>
              <p className="text-[9px] text-brand-muted">avg rating</p>
            </div>
          </div>
          {/* plant */}
          <div className="absolute bottom-3 left-0 flex h-10 w-10 items-center justify-center rounded-full bg-brand-pink/30">
            <Heart size={16} className="text-white" />
          </div>
          {/* location pin */}
          <div className="absolute top-2 left-24 flex h-9 w-9 items-center justify-center rounded-full bg-white text-brand-pink shadow-lg">
            <MapPin size={16} />
          </div>
        </div>
      </div>
    </div>
  );
}
