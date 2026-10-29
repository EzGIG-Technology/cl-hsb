import { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { divIcon } from 'leaflet';
import { Plus, Minus, RotateCw } from 'lucide-react';
import { locationTotals } from '../data/reports';

const BANGI_CENTER: [number, number] = [2.94, 101.75];
const DEFAULT_ZOOM = 11;

function markerIcon(count: number) {
  const min = 30;
  const max = 50;
  const size = Math.max(min, Math.min(max, min + (count / 60) * (max - min)));
  const pink = count > 30;
  return divIcon({
    className: '',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    html: `
      <div style="position:relative;width:${size}px;height:${size}px;display:flex;align-items:center;justify-content:center;">
        <div style="position:relative;width:${size}px;height:${size}px;border-radius:9999px;background:${pink ? '#c42474' : '#2f2b55'};border:2px solid white;display:flex;align-items:center;justify-content:center;color:white;font-weight:600;font-size:${size * 0.32}px;font-family:Jost,sans-serif;">
          ${count}
        </div>
      </div>
    `,
  });
}

function ZoomControls() {
  const map = useMap();
  return (
    <div className="absolute right-4 top-4 z-[1000] flex flex-col overflow-hidden rounded-xl bg-white">
      <button
        onClick={() => map.zoomIn()}
        className="flex h-8 w-8 items-center justify-center text-brand-ink hover:bg-brand-cream"
      >
        <Plus size={14} />
      </button>
      <button
        onClick={() => map.zoomOut()}
        className="flex h-8 w-8 items-center justify-center text-brand-ink hover:bg-brand-cream"
      >
        <Minus size={14} />
      </button>
      <button
        onClick={() => map.setView(BANGI_CENTER, DEFAULT_ZOOM)}
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
    <div className="relative h-full w-full overflow-hidden rounded-2xl bg-[#f1f0f7]">
      <style>{`
        .leaflet-container { font-family: Jost, sans-serif; background: #f1f0f7; }
      `}</style>

      <div className="absolute left-4 bottom-4 z-[1000] rounded-full bg-white px-3 py-1.5 text-xs font-medium text-brand-ink">
        Around Bangi Sentral, Selangor
      </div>

      <MapContainer
        center={BANGI_CENTER}
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
                <span className="font-semibold">{loc.name}</span> · {loc.count} clients
              </Popup>
            </Marker>
          ))}
      </MapContainer>
    </div>
  );
}
