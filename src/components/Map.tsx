'use client';

import React from 'react';

interface Hotspot {
  zoneName: string;
  reason: string;
  score: number;
  x: number; // Percentage X position on SVG canvas
  y: number; // Percentage Y position on SVG canvas
}

export default function Map({ hotspots }: { hotspots: Hotspot[] }) {
  return (
    <div className="relative w-full h-full min-h-[450px] bg-[#0d1326] rounded-xl overflow-hidden flex items-center justify-center border border-slate-800/80 p-4">
      {/* Background Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(#3b82f6 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* Styled Singapore Island Vector Backdrop */}
      <svg
        viewBox="0 0 800 450"
        className="w-full h-full max-h-[500px] object-contain drop-shadow-[0_0_25px_rgba(59,130,246,0.15)]"
      >
        {/* Singapore Main Island Silhouette */}
        <path
          d="M 120 220 Q 180 180 280 170 Q 380 160 520 180 Q 640 190 700 240 Q 720 270 680 290 Q 580 320 460 310 Q 320 320 200 300 Q 110 270 120 220 Z"
          fill="#131c35"
          stroke="#1e293b"
          strokeWidth="2"
        />
        {/* Sentosa Island */}
        <path
          d="M 390 325 Q 430 320 460 330 Q 430 340 390 335 Z"
          fill="#131c35"
          stroke="#1e293b"
          strokeWidth="1.5"
        />
        {/* Changi Peninsula Accent */}
        <path
          d="M 660 210 Q 720 220 730 250 Q 680 260 650 230 Z"
          fill="#162244"
          stroke="#2563eb"
          strokeWidth="1"
          strokeDasharray="4 2"
        />
      </svg>

      {/* Dynamic Radar Pulse Hotspots */}
      <div className="absolute inset-0 p-6 pointer-events-none">
        {hotspots.map((spot, idx) => {
          const colorClass = 
            spot.score > 90 
              ? 'bg-red-500 text-red-400 border-red-500/30' 
              : spot.score > 80 
              ? 'bg-amber-500 text-amber-400 border-amber-500/30' 
              : 'bg-blue-500 text-blue-400 border-blue-500/30';

          return (
            <div
              key={idx}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-auto group cursor-pointer"
              style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
            >
              {/* Pulse Ring */}
              <span className={`absolute -inset-3 rounded-full animate-ping opacity-40 ${colorClass.split(' ')[0]}`} />
              
              {/* Center Dot */}
              <div className={`w-5 h-5 rounded-full border-2 border-slate-900 ${colorClass.split(' ')[0]} shadow-lg flex items-center justify-center`}>
                <span className="w-1.5 h-1.5 rounded-full bg-white" />
              </div>

              {/* Hover Tooltip Card */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:flex flex-col bg-[#151B2E] border border-slate-700 text-white text-xs rounded-lg p-2.5 shadow-2xl min-w-[150px] z-50 pointer-events-none">
                <span className="font-bold text-slate-100">{spot.zoneName}</span>
                <span className="text-[10px] text-slate-400 mt-0.5">{spot.reason}</span>
                <div className="mt-1.5 pt-1 border-t border-slate-800 flex justify-between items-center">
                  <span className="text-[10px] text-slate-400">Demand Score:</span>
                  <span className={`font-black ${colorClass.split(' ')[1]}`}>{spot.score}/100</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Map Watermark Legend */}
      <div className="absolute bottom-3 left-3 bg-[#151B2E]/80 backdrop-blur-md border border-slate-800 px-3 py-1.5 rounded-lg text-[11px] text-slate-400 flex items-center gap-3">
        <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-500" /> High (&gt;90)</div>
        <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500" /> Medium (80-90)</div>
        <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-500" /> Normal (&lt;80)</div>
      </div>
    </div>
  );
}
