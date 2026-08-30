'use client';

import React, { useEffect, useRef } from 'react';

interface Hotspot {
  zoneName: string;
  reason: string;
  score: number;
  lat: number;
  lng: number;
}

export default function Map({ hotspots, userLocation }: { hotspots: Hotspot[]; userLocation?: { lat: number; lng: number } | null }) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletInstance = useRef<any>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !mapRef.current) return;

    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.async = true;
    script.onload = () => {
      const L = (window as any).L;
      if (!L) return;

      if (leafletInstance.current) {
        leafletInstance.current.remove();
      }

      const map = L.map(mapRef.current, {
        center: userLocation ? [userLocation.lat, userLocation.lng] : [1.3521, 103.8198],
        zoom: userLocation ? 13 : 12,
        zoomControl: false,
      });

      leafletInstance.current = map;

      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap &copy; CARTO',
        subdomains: 'abcd',
        maxZoom: 19,
      }).addTo(map);

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // Plot All Hotspots
      hotspots.forEach((spot) => {
        const color = spot.score > 90 ? '#ef4444' : spot.score > 80 ? '#f59e0b' : '#3b82f6';
        const customIcon = L.divIcon({
          className: 'custom-map-pin',
          html: `
            <div style="position: relative; display: flex; align-items: center; justify-content: center;">
              <div style="position: absolute; width: 22px; height: 22px; background-color: ${color}; opacity: 0.4; border-radius: 50%; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
              <div style="width: 14px; height: 14px; background-color: ${color}; border: 2px solid #0f172a; border-radius: 50%; box-shadow: 0 0 10px ${color};"></div>
            </div>
          `,
          iconSize: [22, 22],
          iconAnchor: [11, 11],
        });

        const marker = L.marker([spot.lat, spot.lng], { icon: customIcon }).addTo(map);
        marker.bindPopup(`
          <div style="font-family: sans-serif; padding: 4px; color: #0f172a;">
            <strong style="display: block; font-size: 13px;">${spot.zoneName}</strong>
            <span style="font-size: 11px; color: #475569;">${spot.reason}</span>
            <div style="margin-top: 6px; font-weight: bold; color: ${color}; font-size: 12px;">Score: ${spot.score}/100</div>
          </div>
        `);
      });

      // Plot User GPS Pin
      if (userLocation) {
        const userIcon = L.divIcon({
          className: 'user-gps-pin',
          html: `
            <div style="position: relative; display: flex; align-items: center; justify-content: center;">
              <div style="position: absolute; width: 32px; height: 32px; background-color: #10b981; opacity: 0.4; border-radius: 50%; animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
              <div style="width: 18px; height: 18px; background-color: #10b981; border: 3px solid #ffffff; border-radius: 50%; box-shadow: 0 0 15px #10b981;"></div>
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });

        const userMarker = L.marker([userLocation.lat, userLocation.lng], { icon: userIcon }).addTo(map);
        userMarker.bindPopup('<strong style="color: #10b981;">📍 Your Current Location</strong>').openPopup();
      }
    };

    document.body.appendChild(script);

    return () => {
      if (leafletInstance.current) {
        leafletInstance.current.remove();
        leafletInstance.current = null;
      }
    };
  }, [hotspots, userLocation]);

  return (
    <div className="relative w-full h-full min-h-[520px] rounded-xl overflow-hidden border border-slate-800">
      <div ref={mapRef} className="w-full h-full min-h-[520px] z-10" />
    </div>
  );
}
