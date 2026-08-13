import type { ReactElement } from 'react';
import { Waves } from 'lucide-react';
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

function polar(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

/** Dense radiating small-petal rings — Dahlia's layered bloom. */
function DahliaMotif() {
  const outer = Array.from({ length: 12 }, (_, i) => (i * 360) / 12 + 15);
  const inner = Array.from({ length: 8 }, (_, i) => (i * 360) / 8);
  return (
    <>
      {outer.map((a) => {
        const p = polar(50, 50, 30, a);
        return <ellipse key={`o${a}`} cx={p.x} cy={p.y} rx="7" ry="4" fill="white" fillOpacity="0.5" transform={`rotate(${a} ${p.x} ${p.y})`} />;
      })}
      {inner.map((a) => {
        const p = polar(50, 50, 17, a);
        return <ellipse key={`i${a}`} cx={p.x} cy={p.y} rx="8" ry="5" fill="white" fillOpacity="0.85" transform={`rotate(${a} ${p.x} ${p.y})`} />;
      })}
      <circle cx="50" cy="50" r="6" fill="white" />
    </>
  );
}

/** Overlapping spiral petals — Mawar (rose). */
function MawarMotif() {
  const petal = (scale: number, opacity: number, rotate: number, key: string) => (
    <path
      key={key}
      d={`M 50 50 C ${50 + 15 * scale} ${50 - 10 * scale}, ${50 + 18 * scale} ${50 - 30 * scale}, 50 ${50 - 38 * scale} C ${50 - 18 * scale} ${
        50 - 30 * scale
      }, ${50 - 15 * scale} ${50 - 10 * scale}, 50 50 Z`}
      fill="white"
      fillOpacity={opacity}
      transform={`rotate(${rotate} 50 50)`}
    />
  );
  return (
    <>
      {petal(1, 0.35, 0, 'p1')}
      {petal(0.8, 0.55, 120, 'p2')}
      {petal(0.6, 0.85, 240, 'p3')}
      <circle cx="50" cy="50" r="4" fill="white" />
    </>
  );
}

/** Small star blossom + two satellite buds — Melur (jasmine), clustered small flowers. */
function MelurMotif() {
  const points: string[] = [];
  for (let i = 0; i < 5; i++) {
    const oa = -90 + i * 72;
    const ia = oa + 36;
    const o = polar(50, 42, 15, oa);
    const inn = polar(50, 42, 6, ia);
    points.push(`${o.x},${o.y}`, `${inn.x},${inn.y}`);
  }
  return (
    <>
      <polygon points={points.join(' ')} fill="white" fillOpacity="0.9" />
      <circle cx="28" cy="66" r="6" fill="white" fillOpacity="0.5" />
      <circle cx="70" cy="68" r="5" fill="white" fillOpacity="0.4" />
    </>
  );
}

/** Bold 5-lobed flower with mottled spots — Rafflesia's giant spotted petals. */
function RafflesiaMotif() {
  const lobeAngles = [-90, -18, 54, 126, 198];
  const spots: [number, number][] = [
    [38, 38],
    [63, 40],
    [45, 61],
    [59, 63],
    [50, 47],
  ];
  return (
    <>
      {lobeAngles.map((a) => {
        const p = polar(50, 50, 16, a);
        return <ellipse key={a} cx={p.x} cy={p.y} rx="15" ry="11" fill="white" fillOpacity="0.5" transform={`rotate(${a + 90} ${p.x} ${p.y})`} />;
      })}
      <circle cx="50" cy="50" r="9" fill="white" fillOpacity="0.9" />
      {spots.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="2" fill="rgba(0,0,0,0.18)" />
      ))}
    </>
  );
}

/** Elongated tapered petals, fewer and larger — Cempaka (champaca/magnolia). */
function CempakaMotif() {
  const angles = [0, 60, 120, 180, 240, 300];
  return (
    <>
      {angles.map((a) => (
        <ellipse key={a} cx="50" cy="30" rx="7" ry="21" fill="white" fillOpacity="0.75" transform={`rotate(${a} 50 50)`} />
      ))}
      <circle cx="50" cy="50" r="5" fill="white" />
    </>
  );
}

/** Paper-plane silhouette + dashed flight arc — Oversea placements. */
function OverseaMotif() {
  return (
    <>
      <path d="M22,68 Q50,28 82,42" stroke="white" strokeWidth="2.5" strokeDasharray="4 5" fill="none" strokeLinecap="round" opacity="0.55" />
      <path d="M20 52 L76 34 L54 50 L74 66 Z" fill="white" fillOpacity="0.9" transform="rotate(-10 50 50)" />
    </>
  );
}

/** Heart + gentle belly-curve accent — Seri Ibu prenatal care. */
function SeriIbuMotif() {
  return (
    <>
      <path
        d="M50 38 C44 28, 28 30, 28 44 C28 56, 42 64, 50 72 C58 64, 72 56, 72 44 C72 30, 56 28, 50 38 Z"
        fill="white"
        fillOpacity="0.9"
      />
      <path d="M25 80 Q50 93 75 80" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.45" />
    </>
  );
}

/** Closed bud gently cradled in an open curve — Keguguran (miscarriage-care), deliberately calm, not celebratory. */
function KeguguranMotif() {
  return (
    <>
      <path d="M25 35 Q15 55 30 75 Q40 82 50 76" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.5" />
      <path d="M75 35 Q85 55 70 75 Q60 82 50 76" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.5" />
      <path
        d="M50 30 C44 30, 40 36, 40 44 C40 54, 50 62, 50 62 C50 62, 60 54, 60 44 C60 36, 56 30, 50 30 Z"
        fill="white"
        fillOpacity="0.85"
      />
    </>
  );
}

/** Flame/candle + concentric completion ripples — Penutup Pantang closing ceremony. */
function PenutupPantangMotif() {
  return (
    <>
      <circle cx="50" cy="50" r="34" stroke="white" strokeWidth="1.5" fill="none" opacity="0.16" strokeDasharray="4 8" />
      <circle cx="50" cy="50" r="26" stroke="white" strokeWidth="2" fill="none" opacity="0.28" strokeDasharray="6 6" />
      <path
        d="M50 25 C56 35, 62 42, 58 52 C56 58, 50 60, 50 60 C50 60, 44 58, 42 52 C38 42, 44 35, 50 25 Z"
        fill="white"
        fillOpacity="0.9"
      />
    </>
  );
}

const motifByPackageId: Record<string, () => ReactElement> = {
  dahlia: DahliaMotif,
  mawar: MawarMotif,
  melur: MelurMotif,
  rafflesia: RafflesiaMotif,
  cempaka: CempakaMotif,
  oversea: OverseaMotif,
  'seri-ibu': SeriIbuMotif,
  keguguran: KeguguranMotif,
  'penutup-pantang': PenutupPantangMotif,
};

/**
 * Bespoke small illustration for a package — a gradient badge + a hand-built motif distinct per
 * package (not just a shared lucide glyph in a different color), since no real product photography
 * exists for these mock packages. Color from `theme`, motif from `id`, so every package reads
 * distinctly even at the small sizes (24-64px) this renders at across the app.
 */
export function PackageArt({ pkg, size = 56, rounded = 'rounded-2xl' }: { pkg: Package; size?: number; rounded?: string }) {
  const [from, to] = themeGradients[pkg.theme] ?? themeGradients.pink;
  const Motif = motifByPackageId[pkg.id];

  return (
    <div
      className={`relative shrink-0 overflow-hidden ${rounded} shadow-sm`}
      style={{ width: size, height: size, background: `linear-gradient(140deg, ${from}, ${to})` }}
    >
      <div className="absolute -right-2 -top-3 h-1/2 w-1/2 rounded-full bg-white/20" />
      <div className="absolute -bottom-3 -left-2 h-2/5 w-2/5 rounded-full bg-black/10" />
      <div className="absolute inset-0 flex items-center justify-center text-white">
        {Motif ? (
          <svg viewBox="0 0 100 100" style={{ width: size * 0.62, height: size * 0.62 }}>
            <Motif />
          </svg>
        ) : (
          <Waves size={size * 0.46} strokeWidth={1.75} />
        )}
      </div>
      <Waves size={size * 0.9} className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-white/10" strokeWidth={1} />
    </div>
  );
}
