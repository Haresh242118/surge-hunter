'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Camera, ArrowLeft, RefreshCw, MapPin } from 'lucide-react';

interface TrafficCam {
  id: string;
  location: string;
  image: string;
  expressway: string;
}

const DEFAULT_CAMS: TrafficCam[] = [
  { id: '4703', location: 'CTE - Exit 14 to Pan Island Expressway', expressway: 'CTE', image: 'https://images.imageservices.traffic.gov.sg/cameras/4703.jpg' },
  { id: '2701', location: 'PIE - Kim Keat Link', expressway: 'PIE', image: 'https://images.imageservices.traffic.gov.sg/cameras/2701.jpg' },
  { id: '1702', location: 'AYE - Near Jurong Town Hall', expressway: 'AYE', image: 'https://images.imageservices.traffic.gov.sg/cameras/1702.jpg' },
  { id: '2702', location: 'Woodlands Causeway Checkpoint', expressway: 'Borders', image: 'https://images.imageservices.traffic.gov.sg/cameras/2702.jpg' },
  { id: '4710', location: 'ECP - Near Changi Airport Entrance', expressway: 'ECP', image: 'https://images.imageservices.traffic.gov.sg/cameras/4710.jpg' },
  { id: '1705', location: 'MCE - Marina Boulevard Exit', expressway: 'MCE', image: 'https://images.imageservices.traffic.gov.sg/cameras/1705.jpg' },
];

export default function CamerasPage() {
  const [cameras, setCameras] = useState<TrafficCam[]>(DEFAULT_CAMS);
  const [filter, setFilter] = useState<string>('ALL');
  const [loading, setLoading] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  const refreshFeeds = () => {
    setLoading(true);
    setLastUpdated(new Date().toLocaleTimeString());
    setTimeout(() => setLoading(false), 600);
  };

  useEffect(() => {
    setLastUpdated(new Date().toLocaleTimeString());
  }, []);

  const filteredCams = filter === 'ALL' ? cameras : cameras.filter(c => c.expressway === filter);

  return (
    <main className="min-h-screen bg-[#0B1020] text-slate-100 p-4 md:p-6 font-sans">
      <div className="max-w-6xl mx-auto flex flex-col gap-6">
        {/* Navigation & Header */}
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
                <Camera className="w-5 h-5 text-blue-400" />
                LTA Live Traffic Cameras
              </h1>
              <p className="text-xs text-slate-400">Real-time highway snapshots across Singapore expressways</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400">Updated: {lastUpdated}</span>
            <button
              onClick={refreshFeeds}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Feeds</span>
            </button>
          </div>
        </div>

        {/* Expressway Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {['ALL', 'CTE', 'PIE', 'AYE', 'ECP', 'MCE', 'Borders'].map((exp) => (
            <button
              key={exp}
              onClick={() => setFilter(exp)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 ${
                filter === exp
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700'
              }`}
            >
              {exp}
            </button>
          ))}
        </div>

        {/* Camera Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCams.map((cam) => (
            <div key={cam.id} className="bg-[#151B2E] border border-slate-800 rounded-xl overflow-hidden flex flex-col">
              <div className="p-3 border-b border-slate-800 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5 truncate">
                  <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span className="truncate">{cam.location}</span>
                </span>
                <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded border border-slate-700">
                  {cam.expressway}
                </span>
              </div>
              <div className="relative aspect-video bg-slate-900 flex items-center justify-center overflow-hidden">
                <img
                  src={`${cam.image}?t=${Date.now()}`}
                  alt={cam.location}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback visual if live image link is offline
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                <div className="absolute inset-0 bg-slate-950/60 flex items-center justify-center p-4 text-center text-xs text-slate-400 -z-0">
                  <span>Camera Stream Loading / Refreshing...</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}