import { useState } from 'react';
import { Plus, Minus, RotateCw } from 'lucide-react';
import { locationTotals } from '../data/reports';

const regionShapes = [
  { d: 'M60 40 Q120 10 200 40 Q260 70 240 140 Q220 200 150 210 Q80 200 50 150 Q30 90 60 40 Z', fill: '#eef2ea' },
  { d: 'M200 40 Q280 30 320 90 Q340 140 300 180 Q260 210 220 190 Q210 140 200 40 Z', fill: '#e7edf3' },
];

function bubbleSize(count: number) {
  const min = 30;
  const max = 56;
  const scaled = min + (count / 60) * (max - min);
  return Math.max(min, Math.min(max, scaled));
}

interface OperationsMapProps {
  compact?: boolean;
}

export function OperationsMap({ compact = false }: OperationsMapProps) {
  const [zoom, setZoom] = useState(1);

  return (
    <div className="relative h-full w-full overflow-hidden rounded-2xl bg-[#f4f6f1]">
      <div className="absolute left-4 top-4 z-10 flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-medium text-brand-ink shadow-sm">
        <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
        Live
      </div>

      <div className="absolute right-4 top-4 z-10 flex flex-col overflow-hidden rounded-xl bg-white shadow-sm">
        <button
          onClick={() => setZoom((z) => Math.min(2, z + 0.15))}
          className="flex h-8 w-8 items-center justify-center border-b border-black/5 text-brand-ink hover:bg-brand-cream"
        >
          <Plus size={14} />
        </button>
        <button
          onClick={() => setZoom((z) => Math.max(0.7, z - 0.15))}
          className="flex h-8 w-8 items-center justify-center border-b border-black/5 text-brand-ink hover:bg-brand-cream"
        >
          <Minus size={14} />
        </button>
        <button onClick={() => setZoom(1)} className="flex h-8 w-8 items-center justify-center text-brand-ink hover:bg-brand-cream">
          <RotateCw size={12} />
        </button>
      </div>

      <div
        className="absolute inset-0 flex items-center justify-center transition-transform duration-200"
        style={{ transform: `scale(${zoom})` }}
      >
        <svg viewBox="0 0 360 240" className="h-[92%] w-[92%]">
          {regionShapes.map((r, i) => (
            <path key={i} d={r.d} fill={r.fill} stroke="#dfe6da" strokeWidth={1} />
          ))}
          <g fontFamily="Inter, sans-serif" fontSize="9" fill="#8b7d87">
            <text x="70" y="55">SELANGOR</text>
            <text x="195" y="35">Gombak</text>
            <text x="245" y="60">KUALA LUMPUR</text>
            <text x="150" y="100">Petaling</text>
            <text x="270" y="110">Ulu Langat</text>
            <text x="80" y="150">Klang</text>
            <text x="140" y="185">Kuala Lang{'…'}</text>
            <text x="235" y="165">Sepang</text>
          </g>
        </svg>

        {locationTotals.map((loc) => {
          const size = bubbleSize(loc.count);
          return (
            <div
              key={loc.name}
              className="absolute flex flex-col items-center"
              style={{ left: `${loc.lng}%`, top: `${loc.lat}%`, transform: 'translate(-50%, -50%)' }}
            >
              <div
                className="flex items-center justify-center rounded-full border-2 border-white font-semibold text-white shadow-md"
                style={{
                  width: size,
                  height: size,
                  fontSize: size * 0.32,
                  backgroundColor: loc.count > 40 ? '#21493a' : '#c98a3b',
                }}
                title={`${loc.name}: ${loc.count} CLs`}
              >
                {loc.count}
              </div>
              {!compact && <span className="mt-1 text-[10px] font-medium text-brand-muted">{loc.name}</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
