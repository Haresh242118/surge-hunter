'use client';

import React, { useState } from 'react';
import { X, Calculator, DollarSign, Fuel } from 'lucide-react';

interface ProfitProps {
  isOpen: boolean;
  onClose: () => void;
  baseFare: number;
}

export default function ProfitCalculatorModal({ isOpen, onClose, baseFare }: ProfitProps) {
  const [vehicleType, setVehicleType] = useState<'petrol' | 'hybrid' | 'ev'>('hybrid');
  const [distanceKm, setDistanceKm] = useState<number>(12);
  const [commissionRate, setCommissionRate] = useState<number>(20);
  const [grossFare, setGrossFare] = useState<number>(baseFare * 1.5);

  if (!isOpen) return null;

  const costPerKm = vehicleType === 'petrol' ? 0.22 : vehicleType === 'hybrid' ? 0.14 : 0.08;
  const platformCut = grossFare * (commissionRate / 100);
  const fuelCost = distanceKm * costPerKm;
  const netEarnings = grossFare - platformCut - fuelCost;
  const netMargin = Math.max(0, Math.min(100, (netEarnings / grossFare) * 100)).toFixed(1);

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#151B2E] border border-slate-800 rounded-xl max-w-lg w-full p-5 shadow-2xl flex flex-col gap-4 text-slate-100">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Calculator className="w-4 h-4 text-emerald-400" />
              Driver Net Profit Calculator
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Calculate real earnings after commission and fuel/EV costs</p>
          </div>
          <button onClick={onClose} className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1.5">Vehicle Energy Type:</label>
          <div className="grid grid-cols-3 gap-2">
            {(['petrol', 'hybrid', 'ev'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setVehicleType(type)}
                className={`py-2 px-3 rounded-lg text-xs font-semibold capitalize transition-all border ${
                  vehicleType === type
                    ? 'bg-emerald-600/20 text-emerald-400 border-emerald-500/40'
                    : 'bg-[#0B1020] text-slate-400 border-slate-800 hover:bg-slate-800'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <label className="text-slate-400 block mb-1">Gross Fare (SGD):</label>
            <div className="relative">
              <DollarSign className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
              <input
                type="number"
                value={grossFare}
                onChange={(e) => setGrossFare(Number(e.target.value))}
                className="w-full bg-[#0B1020] border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="text-slate-400 block mb-1">Trip Distance (KM):</label>
            <div className="relative">
              <Fuel className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
              <input
                type="number"
                value={distanceKm}
                onChange={(e) => setDistanceKm(Number(e.target.value))}
                className="w-full bg-[#0B1020] border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="text-xs text-slate-400 block mb-1">Platform Commission Rate:</label>
          <div className="flex items-center gap-2">
            {[
              { label: 'Grab (20%)', rate: 20 },
              { label: 'Gojek (15%)', rate: 15 },
              { label: 'TADA (0%)', rate: 0 },
            ].map((p) => (
              <button
                key={p.label}
                onClick={() => setCommissionRate(p.rate)}
                className={`px-2.5 py-1 rounded text-[11px] font-medium border ${
                  commissionRate === p.rate
                    ? 'bg-blue-600/20 text-blue-400 border-blue-500/40'
                    : 'bg-[#0B1020] text-slate-400 border-slate-800'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-[#0B1020] border border-emerald-500/30 p-4 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-xs text-emerald-400 font-semibold block">Estimated Net Profit</span>
            <span className="text-2xl font-black text-white">S${netEarnings.toFixed(2)}</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">
              Cut: S${platformCut.toFixed(2)} | Fuel/EV: S${fuelCost.toFixed(2)}
            </span>
          </div>
          <div className="text-right">
            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
              {netMargin}% Margin
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
