'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { AlertTriangle, Navigation, RefreshCw } from 'lucide-react';

const SurgeMap = dynamic(() => import('../components/Map'), { 
  ssr: false, 
  loading: () => <div className="h-[480px] flex items-center justify-center text-slate-500 text-sm animate-pulse">Loading Map...</div> 
});

const PLATFORMS = ['Grab', 'Gojek', 'TADA', 'Ryde'];

export default function DashboardPage() {
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['Grab', 'Gojek', 'TADA', 'Ryde']);
  const [loading, setLoading] = useState<boolean>(false);

  const [hotspots] = useState([
    { zoneName: 'Changi Airport T3', reason: 'High incoming arrivals', score: 94, lat: 1.3560, lng: 103.9870 },
    { zoneName: 'Marina Bay Sands', reason: 'Event crowd dispersion', score: 88, lat: 1.2834, lng: 103.8607 },
    { zoneName: 'Orchard Road', reason: 'Peak shopping hours', score: 79, lat: 1.3048, lng: 103.8318 }
  ]);

  const togglePlatform = (p: string) => {
    setSelectedPlatforms(prev => prev.includes(p) ? prev.filter(item => item !== p) : [...prev, p]);
  };

  return (
    <main className="min-h-screen bg-[#0B1020] text-slate-100 flex flex-col font-sans">
      <div className="bg-amber-500/10 border-b border-amber-500/30 text-amber-400 px-4 py-2 text-xs font-semibold flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          <span>SURGE HUNTER LIVE — Monitoring Active Demand</span>
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

        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-slate-400 font-medium mr-2">Platforms:</span>
          {PLATFORMS.map((p) => (
            <button
              key={p}
              onClick={() => togglePlatform(p)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedPlatforms.includes(p)
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                  : 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </header>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-4 p-4">
        <div className="lg:col-span-3 bg-[#151B2E] border border-slate-800 rounded-xl p-1 min-h-[500px] flex items-center justify-center relative overflow-hidden">
          <SurgeMap hotspots={hotspots} />
        </div>

        <div className="bg-[#151B2E] border border-slate-800 rounded-xl p-4 flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="font-bold text-sm text-white flex items-center gap-2">
              <Navigation className="w-4 h-4 text-blue-400" />
              High Demand Hotspots
            </h2>
            <button onClick={() => setLoading(!loading)} className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {hotspots.map((spot, idx) => (
              <div key={idx} className="bg-[#0B1020] border border-slate-800 rounded-lg p-3 hover:border-slate-600 transition-colors cursor-pointer">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-sm text-slate-200">{spot.zoneName}</h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">{spot.reason}</p>
                  </div>
                  <div className="text-right">
                    <span className={`text-lg font-black ${spot.score > 90 ? 'text-red-400' : spot.score > 80 ? 'text-amber-400' : 'text-blue-400'}`}>
                      {spot.score}
                    </span>
                    <span className="text-[10px] block text-slate-500">/100</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
