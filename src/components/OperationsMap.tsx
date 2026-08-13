import { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { divIcon } from 'leaflet';
import { Plus, Minus, RotateCw } from 'lucide-react';
import { locationTotals } from '../data/reports';

const KLANG_VALLEY_CENTER: [number, number] = [2.98, 101.62];
const DEFAULT_ZOOM = 10;

function markerIcon(count: number) {
  const min = 30;
  const max = 50;
  const size = Math.max(min, Math.min(max, min + (count / 60) * (max - min)));
  const pink = count > 40;
  return divIcon({
    className: '',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    html: `
      <div style="position:relative;width:${size}px;height:${size}px;display:flex;align-items:center;justify-content:center;">
        <span class="ops-map-ping" style="position:absolute;inset:0;border-radius:9999px;background:${pink ? '#d94f8c' : '#3c6f57'};opacity:0.35;"></span>
        <div style="position:relative;width:${size}px;height:${size}px;border-radius:9999px;background:${pink ? '#d94f8c' : '#21493a'};border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.25);display:flex;align-items:center;justify-content:center;color:white;font-weight:600;font-size:${size * 0.32}px;font-family:Inter,sans-serif;">
          ${count}
        </div>
      </div>
    `,
  });
}

function ZoomControls() {
  const map = useMap();
  return (
    <div className="absolute right-4 top-4 z-[1000] flex flex-col overflow-hidden rounded-xl bg-white shadow-sm">
      <button
        onClick={() => map.zoomIn()}
        className="flex h-8 w-8 items-center justify-center border-b border-black/5 text-brand-ink hover:bg-brand-cream"
      >
        <Plus size={14} />
      </button>
      <button
        onClick={() => map.zoomOut()}
        className="flex h-8 w-8 items-center justify-center border-b border-black/5 text-brand-ink hover:bg-brand-cream"
      >
        <Minus size={14} />
      </button>
      <button
        onClick={() => map.setView(KLANG_VALLEY_CENTER, DEFAULT_ZOOM)}
        className="flex h-8 w-8 items-center justify-center text-brand-ink hover:bg-brand-cream"
      >
        <RotateCw size={12} />
      </button>
    </div>
  );
}

interface OperationsMapProps {
  compact?: boolean;
}

export function OperationsMap({ compact = false }: OperationsMapProps) {
  const [ready, setReady] = useState(false);

  return (
    <div className="relative h-full w-full overflow-hidden rounded-2xl bg-[#eef1ea]">
      <style>{`
        .ops-map-ping { animation: ops-map-pulse 2.4s cubic-bezier(0,0,0.2,1) infinite; }
        @keyframes ops-map-pulse { 0% { transform: scale(0.9); opacity: 0.45; } 75%, 100% { transform: scale(1.7); opacity: 0; } }
        .leaflet-container { font-family: Inter, sans-serif; background: #eef1ea; }
      `}</style>

      <div className="absolute left-4 top-4 z-[1000] flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-medium text-brand-ink shadow-sm">
        <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
        Live
      </div>

      <div className="absolute left-4 bottom-4 z-[1000] rounded-full bg-white/90 px-3 py-1.5 text-[11px] font-medium text-brand-muted shadow-sm">
        Selangor &amp; Kuala Lumpur — Malaysia
      </div>

      <MapContainer
        center={KLANG_VALLEY_CENTER}
        zoom={DEFAULT_ZOOM}
        className="h-full w-full"
        zoomControl={false}
        attributionControl={compact}
        whenReady={() => setReady(true)}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution={compact ? undefined : '&copy; OpenStreetMap contributors'}
        />
        <ZoomControls />
        {ready &&
          locationTotals.map((loc) => (
            <Marker key={loc.name} position={[loc.lat, loc.lng]} icon={markerIcon(loc.count)}>
              <Popup>
                <span className="font-semibold">{loc.name}</span> — {loc.count} active CLs
              </Popup>
            </Marker>
          ))}
      </MapContainer>
    </div>
  );
}
