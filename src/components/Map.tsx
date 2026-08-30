'use client';

import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Next.js Leaflet icon path issues
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export default function Map({ hotspots }: { hotspots: any[] }) {
  // Center map on Singapore
  const sgCenter: [number, number] = [1.3521, 103.8198];

  return (
    <MapContainer 
      center={sgCenter} 
      zoom={11.5} 
      style={{ height: '100%', width: '100%', borderRadius: '0.75rem', zIndex: 10 }}
    >
      {/* Dark theme map tiles via CartoDB */}
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
      />
      
      {hotspots.map((spot, idx) => (
        <CircleMarker
          key={idx}
          center={spot.coords}
          radius={spot.score / 4} // Size correlates to demand score
          pathOptions={{ 
            color: spot.score > 90 ? '#ef4444' : spot.score > 80 ? '#f59e0b' : '#3b82f6', 
            fillColor: spot.score > 90 ? '#ef4444' : spot.score > 80 ? '#f59e0b' : '#3b82f6', 
            fillOpacity: 0.4,
            weight: 2
          }}
        >
          <Popup>
            <div className="font-sans">
              <strong className="block text-slate-900">{spot.zoneName}</strong>
              <span className="text-sm text-slate-600">Surge Score: {spot.score}/100</span>
            </div>
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}