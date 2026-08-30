Set-Content -Path "src/app/page.tsx" -Value @'
'use client';

import React, { useState, useEffect } from 'react';
import { AlertTriangle, Navigation, RefreshCw } from 'lucide-react';

const PLATFORMS = ['Grab', 'Gojek', 'TADA', 'Ryde'];

export default function DashboardPage() {
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['Grab', 'Gojek', 'TADA', 'Ryde']);
  const [hotspots, setHotspots] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchSurgeData();
  }, [selectedPlatforms]);

  const fetchSurgeData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/surge/calculate');
      const data = await res.json();
      setHotspots(data.hotspots || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const togglePlatform = (p: string) => {
    setSelectedPlatforms(prev =>
      prev.includes(p) ? prev.filter(item => item !== p) : [...prev, p]
    );
  };

  return (
    <main className="min-h-screen bg-[#0B1020] text-slate-100 flex flex-col font-sans">
      <div className="bg-amber-500/10 border-b border-amber-500/30 text-amber-400 px-4 py-2 text-xs font-semibold flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          <span>DEMO DATA ACTIVE — Synthetic surge metrics active.</span>
        </div>
        <span className="bg-amber-500/20 px-2 py-0.5 rounded text-[10px]">SIMULATION MODE</span>
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
          {PLATFORMS.map((p) => {
            const active = selectedPlatforms.includes(p);
            return (
              <button
                key={p}
                onClick={() => togglePlatform(p)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  active
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                    : 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700'
                }`}
              >
                {p}
              </button>
            );
          })}
        </div>
      </header>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-4 p-4">
        <div className="lg:col-span-3 bg-[#151B2E] border border-slate-800 rounded-xl p-4 min-h-[500px] flex items-center justify-center">
          <p className="text-slate-400 text-sm">Interactive Map Active — Hotspots Loaded: {hotspots.length}</p>
        </div>

        <div className="bg-[#151B2E] border border-slate-800 rounded-xl p-4 flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="font-bold text-sm text-white flex items-center gap-2">
              <Navigation className="w-4 h-4 text-blue-400" />
              Best Places To Go Now
            </h2>
            <button
              onClick={fetchSurgeData}
              className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {hotspots.map((spot, idx) => (
              <div key={idx} className="bg-[#0B1020] border border-slate-800 rounded-lg p-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-sm text-slate-200">{spot.zoneName}</h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">{spot.reason}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-black text-emerald-400">{spot.score}</span>
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
'@ -Encoding utf8