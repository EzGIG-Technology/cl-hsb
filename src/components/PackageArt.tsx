import { Flower2, Sparkles, Waves, Plane, HeartPulse, Flame, Leaf } from 'lucide-react';
import type { Package } from '../types';

const themeGradients: Record<Package['theme'], [string, string]> = {
  pink: ['#f6a8c9', '#d94f8c'],
  purple: ['#c9a8e8', '#8b5fbf'],
  teal: ['#8fd6c9', '#2f9b87'],
  red: ['#f2a3a3', '#c94f4f'],
  brown: ['#d8b48c', '#a3703f'],
  blue: ['#a8c8f0', '#4f7fc9'],
  green: ['#a8d9b8', '#3c6f57'],
};

const iconByPackageId: Record<string, typeof Flower2> = {
  dahlia: Flower2,
  mawar: Flower2,
  melur: Flower2,
  rafflesia: Flower2,
  cempaka: Flower2,
  oversea: Plane,
  'seri-ibu': HeartPulse,
  keguguran: Leaf,
  'penutup-pantang': Flame,
};

/**
 * Small decorative "graphic" for a package — a gradient badge + icon — since no real
 * product photography exists for these mock packages. Keyed off `theme` for color and
 * `id` for icon so every package reads distinctly instead of a flat colored chip.
 */
export function PackageArt({ pkg, size = 56, rounded = 'rounded-2xl' }: { pkg: Package; size?: number; rounded?: string }) {
  const [from, to] = themeGradients[pkg.theme] ?? themeGradients.pink;
  const Icon = iconByPackageId[pkg.id] ?? Sparkles;

  return (
    <div
      className={`relative shrink-0 overflow-hidden ${rounded} shadow-sm`}
      style={{ width: size, height: size, background: `linear-gradient(140deg, ${from}, ${to})` }}
    >
      <div className="absolute -right-2 -top-3 h-1/2 w-1/2 rounded-full bg-white/20" />
      <div className="absolute -bottom-3 -left-2 h-2/5 w-2/5 rounded-full bg-black/10" />
      <div className="absolute inset-0 flex items-center justify-center text-white">
        <Icon size={size * 0.46} strokeWidth={1.75} />
      </div>
      <Waves size={size * 0.9} className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-white/10" strokeWidth={1} />
    </div>
  );
}
