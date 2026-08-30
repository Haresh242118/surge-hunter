'use client';

import React, { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { AlertTriangle, Navigation, RefreshCw, Crosshair, TrendingUp, DollarSign } from 'lucide-react';

const SurgeMap = dynamic(() => import('../components/Map'), { 
  ssr: false, 
  loading: () => <div className="h-[520px] flex items-center justify-center text-slate-500 text-sm animate-pulse">Loading OpenStreetMap...</div> 
});

const PLATFORMS = ['Grab', 'Gojek', 'TADA', 'Ryde'];

const INITIAL_HOTSPOTS = [
  { zoneName: 'Changi Airport T3', reason: 'High incoming international arrivals', score: 94, lat: 1.3560, lng: 103.9870, baseFare: 28 },
  { zoneName: 'Marina Bay Sands', reason: 'Event & casino crowd dispersion', score: 88, lat: 1.2834, lng: 103.8607, baseFare: 18 },
  { zoneName: 'Orchard Road', reason: 'Peak shopping & dining hours', score: 82, lat: 1.3048, lng: 103.8318, baseFare: 15 },
  { zoneName: 'VivoCity & Sentosa Gateway', reason: 'Weekend island traffic bottleneck', score: 85, lat: 1.2644, lng: 103.8222, baseFare: 20 },
  { zoneName: 'Jurong East Central', reason: 'Commuter interchange rush hour', score: 78, lat: 1.3329, lng: 103.7436, baseFare: 22 },
  { zoneName: 'Woodlands Checkpoint', reason: 'Cross-border causeway congestion', score: 91, lat: 1.4423, lng: 103.7698, baseFare: 30 },
  { zoneName: 'Suntec City & Convention Centre', reason: 'Exhibition & business peak exit', score: 80, lat: 1.2933, lng: 103.8572, baseFare: 16 },
  { zoneName: 'Clarke Quay', reason: 'Nightlife & dining pickup surge', score: 89, lat: 1.2906, lng: 103.8465, baseFare: 19 },
];

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return (R * c).toFixed(1);
}

export default function DashboardPage() {
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['Grab', 'Gojek', 'TADA', 'Ryde']);
  const [hotspots] = useState(INITIAL_HOTSPOTS);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [userSurgeScore, setUserSurgeScore] = useState<number | null>(null);
  const [gpsStatus, setGpsStatus] = useState<string>('Detecting Location...');
  const [loading, setLoading] = useState<boolean>(false);
  const [multipliers, setMultipliers] = useState<Record<string, string>>({ Grab: '1.5', Gojek: '1.3', TADA: '1.1', Ryde: '1.2' });

  const fetchSurgeData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/surge');
      const data = await res.json();
      if (data.platformSurges) {
        setMultipliers(data.platformSurges);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const togglePlatform = (p: string) => {
    setSelectedPlatforms(prev => prev.includes(p) ? prev.filter(item => item !== p) : [...prev, p]);
  };

  const getUserLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setGpsStatus('GPS not supported');
      return;
    }
    setGpsStatus('Locating...');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });

        let minDistance = Infinity;
        let closestHotspot = hotspots[0];

        hotspots.forEach((spot) => {
          const dist = parseFloat(calculateDistance(latitude, longitude, spot.lat, spot.lng));
          if (dist < minDistance) {
            minDistance = dist;
            closestHotspot = spot;
          }
        });

        const localScore = minDistance < 1 ? closestHotspot.score : Math.max(50, closestHotspot.score - Math.floor(minDistance * 5));
        setUserSurgeScore(localScore);
        setGpsStatus(`Near ${closestHotspot.zoneName} (${minDistance} km)`);
      },
      () => {
        setGpsStatus('Location access blocked');
      }
    );
  }, [hotspots]);

  useEffect(() => {
    getUserLocation();
    fetchSurgeData();
  }, [getUserLocation]);

  return (
    <main className="min-h-screen bg-[#0B1020] text-slate-100 flex flex-col font-sans">
      <div className="bg-amber-500/10 border-b border-amber-500/30 text-amber-400 px-4 py-2 text-xs font-semibold flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          <span>SURGE HUNTER LIVE — Monitoring Active Demand ({hotspots.length} Zones)</span>
        </div>
        <span className="bg-amber-500/20 px-2 py-0.5 rounded text-[10px]">ACTIVE</span>
      </div>

      <header className="border-b border-slate-800 bg-[#151B2E] px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-blue-500 animate-pulse"></span>
            🎯 Surge Hunter
          </h1>
          <p className="text-xs text-slate-400">Singapore Ride-Hailing Demand & Surge Monitor</p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={getUserLocation}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-600/30 transition-all"
          >
            <Crosshair className="w-3.5 h-3.5" />
            <span>{gpsStatus}</span>
          </button>

          <div className="flex items-center gap-2 border-l border-slate-700 pl-3">
            <span className="text-xs text-slate-400 font-medium">Platforms:</span>
            {PLATFORMS.map((p) => (
              <button
                key={p}
                onClick={() => togglePlatform(p)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
                  selectedPlatforms.includes(p)
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                    : 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700'
                }`}
              >
                <span>{p}</span>
                <span className="text-[10px] opacity-80">({multipliers[p] || '1.0'}x)</span>
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-4 p-4">
        <div className="lg:col-span-3 bg-[#151B2E] border border-slate-800 rounded-xl p-1 min-h-[520px] flex items-center justify-center relative overflow-hidden">
          <SurgeMap hotspots={hotspots} userLocation={userLocation} />
        </div>

        <div className="bg-[#151B2E] border border-slate-800 rounded-xl p-4 flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="font-bold text-sm text-white flex items-center gap-2">
              <Navigation className="w-4 h-4 text-blue-400" />
              High Demand Hotspots
            </h2>
            <button onClick={fetchSurgeData} className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {userSurgeScore !== null && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 p-3 rounded-lg text-xs">
              <span className="text-emerald-400 font-bold block">Your Location Surge Score:</span>
              <div className="text-2xl font-black text-emerald-400 mt-1">{userSurgeScore} / 100</div>
            </div>
          )}

          <div className="flex-1 overflow-y-auto space-y-3 pr-1 max-h-[480px]">
            {hotspots.map((spot, idx) => {
              const lowestMultiplier = Math.min(...selectedPlatforms.map(p => parseFloat(multipliers[p] || '1.0')));
              const estimatedFare = (spot.baseFare * lowestMultiplier).toFixed(1);

              return (
                <div key={idx} className="bg-[#0B1020] border border-slate-800 rounded-lg p-3 hover:border-slate-600 transition-colors cursor-pointer">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-sm text-slate-200">{spot.zoneName}</h3>
                      <p className="text-[11px] text-slate-400 mt-0.5">{spot.reason}</p>
                      <div className="flex items-center gap-2 mt-2 text-[11px] text-slate-300">
                        <span className="flex items-center text-emerald-400 font-semibold">
                          <DollarSign className="w-3 h-3" /> Est: S${estimatedFare}
                        </span>
                        <span className="flex items-center text-slate-500">
                          <TrendingUp className="w-3 h-3 mr-0.5" /> Base S${spot.baseFare}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`text-lg font-black ${spot.score > 90 ? 'text-red-400' : spot.score > 80 ? 'text-amber-400' : 'text-blue-400'}`}>
                        {spot.score}
                      </span>
                      <span className="text-[10px] block text-slate-500">/100</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </main>
  );
}
