import logoUrl from '../assets/logo.png';

interface LogoProps {
  variant?: 'full' | 'icon';
  size?: number;
  className?: string;
}

/** The real NR Mothercare Confinement logo artwork. `variant` is kept for API compatibility with existing callers. */
export function Logo({ size = 56, className = '' }: LogoProps) {
  return <img src={logoUrl} alt="NR Mothercare Confinement" width={size} height={size} className={`object-contain ${className}`} />;
}
