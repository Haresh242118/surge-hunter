'use client';

import React, { useEffect, useRef } from 'react';

interface Hotspot {
  zoneName: string;
  reason: string;
  score: number;
  lat: number;
  lng: number;
}

interface PickupPoint {
  TaxiCode: string;
  Name: string;
  Latitude: number;
  Longitude: number;
  type?: 'taxi' | 'phv';
}

interface MapProps {
  hotspots: Hotspot[];
  userLocation?: { lat: number; lng: number } | null;
  taxiStands?: PickupPoint[];
  showTaxiStands?: boolean;
}

export default function Map({ 
  hotspots, 
  userLocation, 
  taxiStands = [], 
  showTaxiStands = false 
}: MapProps) {
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

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // Render Hotspots (Pulsing Pins)
      hotspots.forEach((spot) => {
        const color = spot.score > 90 ? '#ef4444' : spot.score > 80 ? '#f59e0b' : '#10b981';
        const customIcon = L.divIcon({
          className: 'custom-map-pin',
          html: `
            <div style="position: relative; display: flex; align-items: center; justify-content: center;">
              <div style="position: absolute; width: 22px; height: 22px; background-color: ${color}; opacity: 0.4; border-radius: 50%; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
              <div style="width: 14px; height: 14px; background-color: ${color}; border: 2px solid #ffffff; border-radius: 50%; box-shadow: 0 0 10px ${color};"></div>
            </div>
          `,
          iconSize: [22, 22],
          iconAnchor: [11, 11],
        });

        const marker = L.marker([spot.lat, spot.lng], { icon: customIcon }).addTo(map);
        marker.bindPopup(`
          <div style="font-family: sans-serif; padding: 4px; color: #0f172a;">
            <strong style="display: block; font-size: 12px;">${spot.zoneName}</strong>
            <span style="font-size: 10px; color: #475569;">${spot.reason}</span>
            <div style="margin-top: 4px; font-weight: bold; color: ${color}; font-size: 11px;">Surge Score: ${spot.score}/100</div>
          </div>
        `);
      });

      // Render Taxi (RED) & PHV (BLUE) Pickup Points
      if (showTaxiStands && taxiStands.length > 0) {
        taxiStands.forEach((point) => {
          const isPhv = point.type === 'phv';
          const bgColor = isPhv ? '#2563eb' : '#dc2626'; // Blue for PHV, Red for Taxi
          const iconSymbol = isPhv ? '🚗' : '🚕';
          const labelPrefix = isPhv ? 'PHV Pickup' : 'Taxi Stand';

          const pointIcon = L.divIcon({
            className: 'pickup-point-pin',
            html: `
              <div style="background-color: ${bgColor}; color: white; border-radius: 6px; padding: 3px 6px; font-size: 9px; font-weight: bold; border: 1.5px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.4); whitespace-nowrap;">
                ${iconSymbol} ${point.TaxiCode}
              </div>
            `,
            iconSize: [50, 22],
            iconAnchor: [25, 11],
          });

          const marker = L.marker([point.Latitude, point.Longitude], { icon: pointIcon }).addTo(map);
          marker.bindPopup(`
            <div style="font-family: sans-serif; padding: 4px; color: #0f172a;">
              <strong style="font-size: 11px; color: ${bgColor};">${iconSymbol} ${labelPrefix}: ${point.TaxiCode}</strong>
              <div style="font-size: 10px; color: #475569; margin-top: 2px;">${point.Name}</div>
            </div>
          `);
        });
      }

      // Render User GPS Pin
      if (userLocation) {
        const userIcon = L.divIcon({
          className: 'user-gps-pin',
          html: `
            <div style="position: relative; display: flex; align-items: center; justify-content: center;">
              <div style="position: absolute; width: 28px; height: 28px; background-color: #10b981; opacity: 0.4; border-radius: 50%; animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
              <div style="width: 16px; height: 16px; background-color: #10b981; border: 2px solid #ffffff; border-radius: 50%; box-shadow: 0 0 12px #10b981;"></div>
            </div>
          `,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });

        const userMarker = L.marker([userLocation.lat, userLocation.lng], { icon: userIcon }).addTo(map);
        userMarker.bindPopup('<strong style="color: #10b981; font-size: 11px;">📍 Your Current GPS Location</strong>').openPopup();
      }
    };

    document.body.appendChild(script);

    return () => {
      if (leafletInstance.current) {
        leafletInstance.current.remove();
        leafletInstance.current = null;
      }
    };
  }, [hotspots, userLocation, taxiStands, showTaxiStands]);

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden border border-slate-800">
      <div ref={mapRef} className="w-full h-full z-10" />
    </div>
  );
}
