'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Camera, ArrowLeft, RefreshCw, MapPin } from 'lucide-react';

interface TrafficCam {
  CameraID: string;
  ImageURL: string;
  Latitude: number;
  Longitude: number;
  expressway?: string;
}

function assignExpressway(lat: number, lng: number): string {
  if (lat > 1.42) return 'Borders';
  if (lng > 103.95) return 'ECP';
  if (lng < 103.75) return 'AYE';
  if (lat > 1.32 && lat < 1.36) return 'PIE';
  if (lng >= 103.82 && lng <= 103.86) return 'CTE';
  return 'MCE';
}

export default function CamerasPage() {
  const [cameras, setCameras] = useState<TrafficCam[]>([]);
  const [filter, setFilter] = useState<string>('ALL');
  const [loading, setLoading] = useState<boolean>(true);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  const fetchLiveCameras = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/cameras');
      const data = await res.json();
      if (data.cameras && data.cameras.length > 0) {
        const labeled = data.cameras.map((c: TrafficCam) => ({
          ...c,
          expressway: assignExpressway(c.Latitude, c.Longitude),
        }));
        setCameras(labeled);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setLastUpdated(new Date().toLocaleTimeString());
    }
  }, []);

  useEffect(() => {
    fetchLiveCameras();
  }, [fetchLiveCameras]);

  const filteredCams = filter === 'ALL' ? cameras : cameras.filter(c => c.expressway === filter);

  return (
    <main className="min-h-screen bg-[#0B1020] text-slate-100 p-4 md:p-6 font-sans">
      <div className="max-w-6xl mx-auto flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <Link 
              href="/" 
              className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-white flex items-center gap-2">
                <Camera className="w-5 h-5 text-emerald-400" />
                Live LTA Expressway Traffic Feeds
              </h1>
              <p className="text-xs text-slate-400">Real-time public highway camera snapshots across Singapore</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400">Updated: {lastUpdated}</span>
            <button
              onClick={fetchLiveCameras}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Streams</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {['ALL', 'CTE', 'PIE', 'AYE', 'ECP', 'MCE', 'Borders'].map((exp) => (
            <button
              key={exp}
              onClick={() => setFilter(exp)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 ${
                filter === exp
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
                  : 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700'
              }`}
            >
              {exp}
            </button>
          ))}
        </div>

        {loading && cameras.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-slate-500 text-sm animate-pulse">
            Loading Live Expressway Camera Feeds...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCams.slice(0, 18).map((cam) => (
              <div key={cam.CameraID} className="bg-[#151B2E] border border-slate-800 rounded-xl overflow-hidden flex flex-col">
                <div className="p-3 border-b border-slate-800 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5 truncate">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Cam #{cam.CameraID}</span>
                  </span>
                  <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded border border-slate-700">
                    {cam.expressway}
                  </span>
                </div>
                <div className="relative aspect-video bg-slate-900 overflow-hidden">
                  <img
                    src={`${cam.ImageURL}?t=${Date.now()}`}
                    alt={`Camera ${cam.CameraID}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
