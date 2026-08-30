'use client';

import React from 'react';
import { X, Calendar, Clock, TrendingUp } from 'lucide-react';

interface AnalyticsProps {
  isOpen: boolean;
  onClose: () => void;
  zoneName: string;
}

const WEEKLY_PEAKS = [
  { day: 'Monday', peakTime: '07:30 AM - 09:30 AM', avgScore: 84, reason: 'Morning commute & office rush' },
  { day: 'Tuesday', peakTime: '08:00 AM - 09:30 AM', avgScore: 78, reason: 'Standard CBD entry traffic' },
  { day: 'Wednesday', peakTime: '06:00 PM - 08:00 PM', avgScore: 82, reason: 'Mid-week evening exit surge' },
  { day: 'Thursday', peakTime: '06:30 PM - 08:30 PM', avgScore: 85, reason: 'Dinner & mall pickup volume' },
  { day: 'Friday', peakTime: '06:00 PM - 11:30 PM', avgScore: 96, reason: 'Weekend nightlife & dining peak' },
  { day: 'Saturday', peakTime: '02:00 PM - 10:00 PM', avgScore: 91, reason: 'Shopping & leisure traffic' },
  { day: 'Sunday', peakTime: '05:00 PM - 09:00 PM', avgScore: 88, reason: 'Airport & weekend return crowd' },
];

export default function AnalyticsModal({ isOpen, onClose, zoneName }: AnalyticsProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#151B2E] border border-slate-800 rounded-xl max-w-2xl w-full p-5 shadow-2xl flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-400" />
              Historical Peak Hours & Analytics
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Weekly demand trends for <span className="text-blue-400 font-semibold">{zoneName}</span></p>
          </div>
          <button onClick={onClose} className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2.5">
          {WEEKLY_PEAKS.map((item, idx) => (
            <div key={idx} className="bg-[#0B1020] border border-slate-800/80 rounded-lg p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <span className="w-20 text-xs font-bold text-slate-200 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-slate-400" />
                  {item.day}
                </span>
                <div>
                  <span className="text-xs text-slate-300 font-semibold flex items-center gap-1">
                    <Clock className="w-3 h-3 text-blue-400" />
                    {item.peakTime}
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">{item.reason}</span>
                </div>
              </div>

              <div className="text-right">
                <span className={`text-sm font-black ${item.avgScore > 90 ? 'text-red-400' : 'text-amber-400'}`}>
                  Avg {item.avgScore}/100
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}