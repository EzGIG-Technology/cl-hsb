import wordmarkUrl from '../assets/logo-wordmark.png';

interface LogoProps {
  variant?: 'full' | 'icon';
  /** Rendered height in px for `full`, edge length for `icon`. */
  size?: number;
  className?: string;
}

/**
 * The Honey Spa logo. `full` is the real wordmark ("honey ✿ spa" + RELAX | REJUVENATE | REJOICE),
 * cut from the published logo with a transparent background (see scripts/optimize-logo.mjs).
 * `icon` is the five-petal lavender flower with its honey bee, redrawn as SVG so it stays crisp at
 * favicon and avatar sizes where the 450px source would blur.
 */
export function Logo({ variant = 'full', size = 48, className = '' }: LogoProps) {
  if (variant === 'icon') return <HoneySpaMark size={size} className={className} />;
  return <img src={wordmarkUrl} alt="Honey Spa: Relax, Rejuvenate, Rejoice" style={{ height: size, width: 'auto' }} className={`object-contain ${className}`} />;
}

const PETAL_ANGLES = [0, 72, 144, 216, 288];

export function HoneySpaMark({ size = 40, className = '' }: { size?: number; className?: string }) {
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} className={className} role="img" aria-label="Honey Spa">
      <g transform="translate(46 58)">
        {PETAL_ANGLES.map((a, i) => (
          <path
            key={a}
            d="M0 -5 C 15 -13, 19 -30, 0 -42 C -19 -30, -15 -13, 0 -5 Z"
            fill={i % 2 === 0 ? '#7d84bd' : '#959cce'}
            transform={`rotate(${a})`}
          />
        ))}
        <circle r="5" fill="#5f66a3" />
        <circle r="2.2" fill="#c5c9ea" />
      </g>
      {/* the bee */}
      <g transform="translate(76 22) rotate(-18)">
        <ellipse cx="-3" cy="-9" rx="6" ry="4.5" fill="#c9ccd6" />
        <ellipse cx="5" cy="-10" rx="6" ry="4.5" fill="#dcdfe6" />
        <ellipse cx="0" cy="0" rx="11" ry="8" fill="#f2a92c" />
        <clipPath id="honeyspa-bee-body">
          <ellipse cx="0" cy="0" rx="11" ry="8" />
        </clipPath>
        <g clipPath="url(#honeyspa-bee-body)" fill="#1f1a24">
          <rect x="-5.5" y="-9" width="3.2" height="18" />
          <rect x="1.5" y="-9" width="3.2" height="18" />
        </g>
        <circle cx="-9.5" cy="0" r="4.5" fill="#1f1a24" />
      </g>
    </svg>
  );
}
