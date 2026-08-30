'use client';

import React, { useState } from 'react';
import { X, Calculator, DollarSign, Fuel, Users, Truck, Car } from 'lucide-react';

interface ProfitProps {
  isOpen: boolean;
  onClose: () => void;
  baseFare: number;
}

export default function ProfitCalculatorModal({ isOpen, onClose, baseFare }: ProfitProps) {
  const [vehicleClass, setVehicleClass] = useState<'4seater' | '6seater' | 'minibus'>('6seater');
  const [vehicleEnergy, setVehicleEnergy] = useState<'petrol' | 'hybrid' | 'ev'>('hybrid');
  const [distanceKm, setDistanceKm] = useState<number>(12);
  const [commissionRate, setCommissionRate] = useState<number>(20);
  const [minibusJobFare, setMinibusJobFare] = useState<number>(50); // $40 - $60 per job range

  if (!isOpen) return null;

  // Fare Calculation
  let grossFare = 0;
  if (vehicleClass === 'minibus') {
    grossFare = minibusJobFare;
  } else if (vehicleClass === '6seater') {
    grossFare = distanceKm * 2.0; // ~$2.00 per KM for 6-seater
  } else {
    grossFare = baseFare * 1.5; // Standard 4-seater estimate
  }

  // Cost per KM based on energy type
  const energyCostPerKm = vehicleEnergy === 'petrol' ? 0.22 : vehicleEnergy === 'hybrid' ? 0.14 : 0.08;
  const fuelCost = distanceKm * energyCostPerKm;
  const platformCut = grossFare * (commissionRate / 100);
  const netEarnings = Math.max(0, grossFare - platformCut - fuelCost);
  const netMargin = grossFare > 0 ? ((netEarnings / grossFare) * 100).toFixed(1) : '0.0';

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#090D18] border border-slate-800 rounded-2xl max-w-lg w-full p-5 shadow-2xl flex flex-col gap-4 text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Calculator className="w-4 h-4 text-emerald-400" />
              Driver Net Profit Calculator
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Customized for 4-Seater, 6-Seater ($2/km), and Minibus ($40-$60/job)</p>
          </div>
          <button onClick={onClose} className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-lg transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Vehicle Class Selector */}
        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1.5 font-mono uppercase tracking-wider">
            Select Vehicle Category:
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setVehicleClass('4seater')}
              className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all border flex flex-col items-center gap-1 ${
                vehicleClass === '4seater'
                  ? 'bg-blue-600/20 text-blue-400 border-blue-500/50 shadow-[0_0_10px_rgba(37,99,235,0.2)]'
                  : 'bg-[#050811] text-slate-400 border-slate-800 hover:bg-slate-800'
              }`}
            >
              <Car className="w-4 h-4" />
              <span>4-Seater</span>
            </button>

            <button
              onClick={() => setVehicleClass('6seater')}
              className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all border flex flex-col items-center gap-1 ${
                vehicleClass === '6seater'
                  ? 'bg-emerald-600/20 text-emerald-400 border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                  : 'bg-[#050811] text-slate-400 border-slate-800 hover:bg-slate-800'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>6-Seater ($2/km)</span>
            </button>

            <button
              onClick={() => setVehicleClass('minibus')}
              className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all border flex flex-col items-center gap-1 ${
                vehicleClass === 'minibus'
                  ? 'bg-amber-600/20 text-amber-400 border-amber-500/50 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
                  : 'bg-[#050811] text-slate-400 border-slate-800 hover:bg-slate-800'
              }`}
            >
              <Truck className="w-4 h-4" />
              <span>Minibus / Maxi</span>
            </button>
          </div>
        </div>

        {/* Inputs based on selection */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          {vehicleClass === 'minibus' ? (
            <div>
              <label className="text-slate-400 block mb-1 font-mono">Job Flat Fare (S$40 - S$60):</label>
              <div className="relative">
                <DollarSign className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
                <input
                  type="number"
                  value={minibusJobFare}
                  onChange={(e) => setMinibusJobFare(Number(e.target.value))}
                  className="w-full bg-[#050811] border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-white font-mono focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          ) : (
            <div>
              <label className="text-slate-400 block mb-1 font-mono">Estimated Gross Fare:</label>
              <div className="relative">
                <DollarSign className="w-3.5 h-3.5 text-emerald-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  disabled
                  value={`S$${grossFare.toFixed(2)}`}
                  className="w-full bg-[#050811] border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-emerald-400 font-bold font-mono"
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-slate-400 block mb-1 font-mono">Trip Distance (KM):</label>
            <div className="relative">
              <Fuel className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
              <input
                type="number"
                value={distanceKm}
                onChange={(e) => setDistanceKm(Number(e.target.value))}
                className="w-full bg-[#050811] border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-white font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Vehicle Energy Type */}
        <div>
          <label className="text-xs text-slate-400 block mb-1 font-mono">Fuel / Energy Type:</label>
          <div className="grid grid-cols-3 gap-2">
            {(['petrol', 'hybrid', 'ev'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setVehicleEnergy(type)}
                className={`py-1.5 px-2 rounded-lg text-xs font-semibold capitalize border transition-all ${
                  vehicleEnergy === type
                    ? 'bg-slate-700 text-white border-slate-500'
                    : 'bg-[#050811] text-slate-500 border-slate-800 hover:text-slate-300'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Commission Presets */}
        <div>
          <label className="text-xs text-slate-400 block mb-1 font-mono">Platform Commission Rate:</label>
          <div className="flex items-center gap-2">
            {[
              { label: 'Grab (20%)', rate: 20 },
              { label: 'Gojek (15%)', rate: 15 },
              { label: 'Direct / Maxi (0%)', rate: 0 },
            ].map((p) => (
              <button
                key={p.label}
                onClick={() => setCommissionRate(p.rate)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium border transition-all ${
                  commissionRate === p.rate
                    ? 'bg-emerald-600/20 text-emerald-400 border-emerald-500/40'
                    : 'bg-[#050811] text-slate-500 border-slate-800'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Calculated Net Profit Display */}
        <div className="bg-[#050811] border border-emerald-500/40 p-4 rounded-xl flex items-center justify-between shadow-inner">
          <div>
            <span className="text-xs text-emerald-400 font-bold block font-mono uppercase tracking-wider">Calculated Net Profit</span>
            <span className="text-2xl font-black text-white font-mono mt-0.5 block">S${netEarnings.toFixed(2)}</span>
            <span className="text-[10px] text-slate-500 block font-mono mt-0.5">
              Cut: S${platformCut.toFixed(2)} | Energy: S${fuelCost.toFixed(2)}
            </span>
          </div>
          <div className="text-right">
            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30 font-mono">
              {netMargin}% Margin
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
