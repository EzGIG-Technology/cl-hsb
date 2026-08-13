import logoUrl from '../assets/logo-256.png';
import logoIconUrl from '../assets/logo-icon-256.png';

interface LogoProps {
  variant?: 'full' | 'icon';
  size?: number;
  className?: string;
}

/**
 * The real NR Mothercare Confinement logo artwork — served as pre-sized/pre-cropped assets
 * (see scripts/optimize-logo.mjs) rather than the 2048px/3.3MB source, which is never imported
 * at runtime. `variant="icon"` crops to just the mother-and-baby silhouette for compact spots.
 */
export function Logo({ variant = 'full', size = 56, className = '' }: LogoProps) {
  const src = variant === 'icon' ? logoIconUrl : logoUrl;
  return <img src={src} alt="NR Mothercare Confinement" width={size} height={size} className={`object-contain ${className}`} />;
}
