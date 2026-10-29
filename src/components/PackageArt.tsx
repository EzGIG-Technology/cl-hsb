import type { ReactElement } from 'react';
import { Flower2 } from 'lucide-react';
import type { Package } from '../types';

// One flat field per theme, all drawn from the Honey Spa logo and price card.
const themeFill: Record<Package['theme'], string> = {
  pink: '#c42474',
  purple: '#6f76b0',
  teal: '#5f9c95',
  red: '#d35d8e',
  brown: '#d9921f',
  blue: '#8c94c4',
  green: '#2f2b55',
};

/** Five open petals, the Honey Spa flower: the full-body signature massage. */
function TraditionalMotif() {
  return (
    <>
      {[0, 72, 144, 216, 288].map((a) => (
        <path key={a} d="M50 46 C 62 38, 66 22, 50 10 C 34 22, 38 38, 50 46 Z" fill="white" fillOpacity={a % 144 === 0 ? 0.95 : 0.7} transform={`rotate(${a} 50 50)`} />
      ))}
      <circle cx="50" cy="50" r="5" fill="white" />
    </>
  );
}

/** Heart cradled by a belly curve: prenatal care. */
function PrenatalMotif() {
  return (
    <>
      <path d="M50 38 C44 28, 28 30, 28 44 C28 56, 42 64, 50 72 C58 64, 72 56, 72 44 C72 30, 56 28, 50 38 Z" fill="white" fillOpacity="0.9" />
      <path d="M25 80 Q50 93 75 80" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.5" />
    </>
  );
}

/** A spine of stacked vertebra pills between two shoulder curves: back massage. */
function BackMotif() {
  return (
    <>
      <path d="M18 34 Q34 22 46 30" stroke="white" strokeWidth="4" fill="none" strokeLinecap="round" opacity="0.6" />
      <path d="M82 34 Q66 22 54 30" stroke="white" strokeWidth="4" fill="none" strokeLinecap="round" opacity="0.6" />
      {[30, 42, 54, 66, 78].map((y) => (
        <rect key={y} x="43" y={y} width="14" height="8" rx="4" fill="white" fillOpacity="0.9" />
      ))}
    </>
  );
}

/** A footprint (sole + five toes): foot massage. */
function FootMotif() {
  return (
    <>
      <path d="M44 36 C 34 40, 32 60, 38 74 C 42 84, 58 84, 60 72 C 62 62, 56 56, 58 46 C 60 38, 52 33, 44 36 Z" fill="white" fillOpacity="0.9" />
      {[
        [62, 24, 6],
        [52, 20, 5],
        [43, 21, 4.2],
        [35, 25, 3.6],
        [29, 31, 3.2],
      ].map(([cx, cy, r]) => (
        <circle key={cx} cx={cx} cy={cy} r={r} fill="white" fillOpacity="0.85" />
      ))}
    </>
  );
}

/** Floating blossoms on ripples: mandi bunga. */
function MandiBungaMotif() {
  return (
    <>
      <path d="M14 70 Q26 62 38 70 T62 70 T86 70" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.5" />
      <path d="M14 82 Q26 74 38 82 T62 82 T86 82" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.35" />
      {[
        [36, 44, 1],
        [64, 36, 0.75],
      ].map(([cx, cy, k]) => (
        <g key={cx} transform={`translate(${cx} ${cy}) scale(${k})`}>
          {[0, 72, 144, 216, 288].map((a) => (
            <ellipse key={a} cx="0" cy="-9" rx="6" ry="9" fill="white" fillOpacity="0.85" transform={`rotate(${a})`} />
          ))}
          <circle r="4" fill="white" />
        </g>
      ))}
    </>
  );
}

/** A face outline with pressure points: totok wajah. */
function TotokWajahMotif() {
  return (
    <>
      <ellipse cx="50" cy="50" rx="24" ry="31" fill="white" fillOpacity="0.9" />
      {[
        [40, 40],
        [60, 40],
        [50, 52],
        [38, 58],
        [62, 58],
        [50, 68],
      ].map(([cx, cy]) => (
        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="3" fill="rgba(0,0,0,0.28)" />
      ))}
    </>
  );
}

/** Three overlapping circles, one per chosen treatment: the Mix & Match bundle. */
function MixMatchMotif() {
  return (
    <>
      <circle cx="38" cy="42" r="18" fill="white" fillOpacity="0.55" />
      <circle cx="62" cy="42" r="18" fill="white" fillOpacity="0.55" />
      <circle cx="50" cy="62" r="18" fill="white" fillOpacity="0.55" />
    </>
  );
}

const motifByPackageId: Record<string, () => ReactElement> = {
  traditional: TraditionalMotif,
  prenatal: PrenatalMotif,
  back: BackMotif,
  foot: FootMotif,
  'mandi-bunga': MandiBungaMotif,
  'totok-wajah': TotokWajahMotif,
  'mix-match': MixMatchMotif,
};

/**
 * Small drawn badge for a treatment: a flat brand-colour field plus a motif made from what the
 * treatment works on (petals, a spine, a footprint, a face). Honey Spa has no product photography
 * of its treatments, so these stand in. Colour from `theme`, motif from `id`.
 */
export function PackageArt({ pkg, size = 56, rounded = 'rounded-2xl' }: { pkg: Package; size?: number; rounded?: string }) {
  const fill = themeFill[pkg.theme] ?? themeFill.pink;
  const Motif = motifByPackageId[pkg.id];

  return (
    <div
      className={`relative shrink-0 overflow-hidden ${rounded}`}
      style={{ width: size, height: size, backgroundColor: fill }}
    >
      <div className="absolute inset-0 flex items-center justify-center text-white">
        {Motif ? (
          <svg viewBox="0 0 100 100" style={{ width: size * 0.62, height: size * 0.62 }}>
            <Motif />
          </svg>
        ) : (
          <Flower2 size={size * 0.46} strokeWidth={1.75} />
        )}
      </div>
    </div>
  );
}
