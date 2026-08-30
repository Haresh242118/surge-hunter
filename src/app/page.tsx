'use client';

import React, { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { AlertTriangle, Navigation, RefreshCw, Crosshair, TrendingUp, DollarSign, Zap, Volume2, VolumeX, Download, Users, Camera, Bell, BarChart3, CloudRain, Calculator, MapPin, Sparkles, Activity, Compass, Tag, Car, Truck, Route } from 'lucide-react';
import AnalyticsModal from '../components/AnalyticsModal';
import ProfitCalculatorModal from '../components/ProfitCalculatorModal';

const SurgeMap = dynamic(() => import('../components/Map'), { 
  ssr: false, 
  loading: () => (
    <div className="h-[420px] md:h-[580px] flex items-center justify-center text-slate-500 text-xs font-mono tracking-wider animate-pulse">
      INITIALIZING MAP ENGINE...
    </div>
  ) 
});

const PLATFORMS = ['Grab', 'Gojek', 'TADA', 'Ryde'];

interface Hotspot {
  zoneName: string;
  reason: string;
  score: number;
  lat: number;
  lng: number;
  baseFare: number;
  avgDistanceKm: number;
}

const INITIAL_HOTSPOTS: Hotspot[] = [
  { zoneName: 'Changi Airport T3', reason: 'High incoming international arrivals', score: 94, lat: 1.3560, lng: 103.9870, baseFare: 14, avgDistanceKm: 18 },
  { zoneName: 'Marina Bay Sands', reason: 'Event & casino crowd dispersion', score: 88, lat: 1.2834, lng: 103.8607, baseFare: 11, avgDistanceKm: 12 },
  { zoneName: 'Orchard Road', reason: 'Peak shopping & dining hours', score: 82, lat: 1.3048, lng: 103.8318, baseFare: 10, avgDistanceKm: 10 },
  { zoneName: 'VivoCity & Sentosa Gateway', reason: 'Weekend island traffic bottleneck', score: 85, lat: 1.2644, lng: 103.8222, baseFare: 12, avgDistanceKm: 14 },
  { zoneName: 'Jurong East Central', reason: 'Commuter interchange rush hour', score: 78, lat: 1.3329, lng: 103.7436, baseFare: 13, avgDistanceKm: 15 },
  { zoneName: 'Woodlands Checkpoint', reason: 'Cross-border causeway congestion', score: 91, lat: 1.4423, lng: 103.7698, baseFare: 18, avgDistanceKm: 22 },
  { zoneName: 'Suntec City & Convention Centre', reason: 'Exhibition & business peak exit', score: 80, lat: 1.2933, lng: 103.8572, baseFare: 10, avgDistanceKm: 11 },
  { zoneName: 'Clarke Quay', reason: 'Nightlife & dining pickup surge', score: 89, lat: 1.2906, lng: 103.8465, baseFare: 11, avgDistanceKm: 9 },
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
  const [hotspots] = useState<Hotspot[]>(INITIAL_HOTSPOTS);
  const [selectedHotspot, setSelectedHotspot] = useState<Hotspot>(INITIAL_HOTSPOTS[0]);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [userSurgeScore, setUserSurgeScore] = useState<number | null>(null);
  const [gpsStatus, setGpsStatus] = useState<string>('GPS Detect');
  const [loading, setLoading] = useState<boolean>(false);
  const [multipliers, setMultipliers] = useState<Record<string, string>>({ Grab: '1.2', Gojek: '1.1', TADA: '1.0', Ryde: '1.1' });
  const [audioEnabled, setAudioEnabled] = useState<boolean>(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [onlineUsers, setOnlineUsers] = useState<number>(14);
  const [weather, setWeather] = useState<{ condition: string; isRaining: boolean; surgeMultiplier: number }>({
    condition: 'Loading NEA Weather...',
    isRaining: false,
    surgeMultiplier: 1.0,
  });
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState<boolean>(false);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState<boolean>(false);
  const [taxiStands, setTaxiStands] = useState<any[]>([]);
  const [showTaxiStands, setShowTaxiStands] = useState<boolean>(false);

  const getForecastForZone = useCallback((baseScore: number) => {
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date();
      d.setHours(d.getHours() + i + 1);
      const fluctuation = Math.floor(Math.sin(i + baseScore) * 12);
      const score = Math.min(99, Math.max(50, Math.floor(baseScore * weather.surgeMultiplier) + fluctuation));
      return {
        time: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        score,
      };
    });
  }, [weather.surgeMultiplier]);

  const forecastData = getForecastForZone(selectedHotspot.score);

  const fetchTaxiStands = async () => {
    try {
      const res = await fetch('/api/taxistands');
      const data = await res.json();
      if (data.pickupPoints) setTaxiStands(data.pickupPoints);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchWeatherData = async () => {
    try {
      const res = await fetch('/api/weather');
      const data = await res.json();
      if (data.condition) {
        setWeather({
          condition: data.condition,
          isRaining: data.isRaining,
          surgeMultiplier: data.surgeMultiplier,
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });

    const fetchOnlineCount = async () => {
      try {
        const res = await fetch('/api/active-users');
        const data = await res.json();
        if (data.onlineUsers) setOnlineUsers(data.onlineUsers);
      } catch (err) {
        console.error(err);
      }
    };

    fetchOnlineCount();
    fetchWeatherData();
    fetchTaxiStands();
    const interval = setInterval(fetchOnlineCount, 10000);
    return () => clearInterval(interval);
  }, []);

  const enablePushNotifications = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        setNotificationsEnabled(true);
        new Notification('🎯 Surge Hunter Driver Alerts Active', {
          body: 'Real-time high surge notifications enabled.',
          icon: 'https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/72x72/1f3af.png',
        });
      }
    }
  };

  const handleInstallClick = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === 'accepted') {
          setDeferredPrompt(null);
        }
      });
    } else {
      alert('To install on iOS: Tap Share -> Add to Home Screen.\nOn Android: Tap browser options (⋮) -> Install App.');
    }
  };

  const speakNotification = (text: string) => {
    if (!audioEnabled || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 0.9;
    window.speechSynthesis.speak(utterance);
  };

  const fetchSurgeData = async () => {
    setLoading(true);
    try {
      await fetchWeatherData();
      const res = await fetch('/api/surge');
      const data = await res.json();
      if (data.platformSurges) {
        setMultipliers(data.platformSurges);
        speakNotification('Updated surge zones.');

        if (notificationsEnabled && 'Notification' in window && Notification.permission === 'granted') {
          const criticalSpot = hotspots.find(h => h.score >= 90);
          if (criticalSpot) {
            new Notification(`🚨 Surge Warning: ${criticalSpot.zoneName}`, {
              body: `Demand index breached ${criticalSpot.score}/100. High driver revenue active.`,
              icon: 'https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/72x72/1f3af.png',
            });
          }
        }
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
      setGpsStatus('GPS Unavailable');
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
        setGpsStatus('GPS Blocked');
      }
    );
  }, [hotspots]);

  useEffect(() => {
    getUserLocation();
    fetchSurgeData();
  }, [getUserLocation]);

  const highDemandZones = hotspots.filter(h => h.score >= 85);

  return (
    <main className="min-h-screen bg-[#030712] text-slate-100 flex flex-col font-sans antialiased selection:bg-emerald-500 selection:text-white relative overflow-x-hidden">
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-emerald-500/5 blur-[140px] pointer-events-none rounded-full" />
      <div className="absolute top-1/3 right-10 w-[400px] h-[400px] bg-blue-500/5 blur-[140px] pointer-events-none rounded-full" />

      <AnalyticsModal 
        isOpen={isAnalyticsOpen} 
        onClose={() => setIsAnalyticsOpen(false)} 
        zoneName={selectedHotspot.zoneName} 
      />

      <ProfitCalculatorModal
        isOpen={isCalculatorOpen}
        onClose={() => setIsCalculatorOpen(false)}
        baseFare={selectedHotspot.baseFare}
      />

      <div className="bg-[#090D16]/90 backdrop-blur-md border-b border-slate-800/80 px-4 py-2 text-[11px] font-mono tracking-wider flex items-center justify-between text-slate-400 z-20">
        <div className="flex items-center gap-2.5">
          <span className="flex h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse" />
          <span className="text-slate-100 font-bold tracking-widest uppercase">SURGE HUNTER PRO</span>
          <span className="text-slate-700">|</span>
          <span className="text-slate-400 hidden sm:inline">LIVE SINGAPORE RIDE MATRIX</span>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-blue-950/40 border border-blue-800/50 text-blue-300 px-2.5 py-0.5 rounded-md">
            <CloudRain className="w-3 h-3 text-blue-400" />
            <span>{weather.condition}</span>
          </div>

          <div className="flex items-center gap-1.5 bg-emerald-950/40 border border-emerald-800/50 text-emerald-400 px-2.5 py-0.5 rounded-md font-semibold">
            <Activity className="w-3 h-3" />
            <span>{onlineUsers} ACTIVE DRIVERS</span>
          </div>
        </div>
      </div>

      <div className="bg-[#050914] border-b border-slate-800/60 py-1.5 px-4 overflow-hidden flex items-center gap-3 text-xs z-20">
        <div className="flex items-center gap-1.5 text-red-400 font-bold bg-red-500/10 px-2 py-0.5 rounded border border-red-500/30 text-[10px] tracking-wide shrink-0">
          <Zap className="w-3 h-3 fill-red-400 animate-bounce" />
          <span>CRITICAL SURGE ALERTS</span>
        </div>
        
        <div className="flex-1 overflow-hidden relative">
          <div className="animate-marquee whitespace-nowrap flex gap-8 items-center text-slate-400 text-[11px] font-mono">
            {highDemandZones.concat(highDemandZones).map((spot, i) => (
              <span key={i} className="flex items-center gap-2">
                <span className="font-semibold text-slate-100">{spot.zoneName}</span>
                <span className="text-slate-500">({spot.reason})</span>
                <span className="text-red-400 font-bold">INDEX: {spot.score}/100</span>
                <span className="text-slate-700">//</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      <header className="border-b border-slate-800/80 bg-[#0A0F1D]/80 backdrop-blur-2xl px-4 md:px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 z-20">
        <div>
          <h1 className="text-xl md:text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
            <Compass className="w-6 h-6 text-emerald-400" />
            Surge Hunter
            <span className="text-[10px] bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-2 py-0.5 rounded-full font-mono tracking-widest uppercase">
              PRO DRIVER
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">Real-time Ride-Hailing Multipliers, Heatmaps & Net Profit Analytics</p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setIsCalculatorOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition-all shadow-[0_0_12px_rgba(16,185,129,0.15)]"
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>Profit Calc</span>
          </button>

          <button
            onClick={() => setShowTaxiStands(!showTaxiStands)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
              showTaxiStands 
                ? 'bg-sky-500/20 text-sky-400 border-sky-500/40 shadow-[0_0_12px_rgba(14,165,233,0.15)]' 
                : 'bg-slate-900/80 text-slate-300 border-slate-800 hover:bg-slate-800'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>{showTaxiStands ? 'Hide Pickup Bays' : 'Taxi/PHV Bays'}</span>
          </button>

          <button
            onClick={() => setIsAnalyticsOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/30 hover:bg-blue-500/20 transition-all"
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Weekly Trends</span>
          </button>

          <Link
            href="/cameras"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-900/80 text-slate-200 border border-slate-800 hover:bg-slate-800 transition-all"
          >
            <Camera className="w-3.5 h-3.5 text-blue-400" />
            <span>Traffic Cams</span>
          </Link>

          <button
            onClick={enablePushNotifications}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
              notificationsEnabled 
                ? 'bg-amber-500/20 text-amber-400 border-amber-500/40' 
                : 'bg-slate-900/80 text-slate-300 border-slate-800 hover:bg-slate-800'
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            <span>{notificationsEnabled ? 'Alerts On' : 'Alerts'}</span>
          </button>

          <button
            onClick={handleInstallClick}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-500/20 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>App</span>
          </button>

          <button
            onClick={() => setAudioEnabled(!audioEnabled)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
              audioEnabled 
                ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' 
                : 'bg-slate-900/80 text-slate-500 border-slate-800 hover:bg-slate-800'
            }`}
          >
            {audioEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span>{audioEnabled ? 'Audio' : 'Muted'}</span>
          </button>

          <button
            onClick={getUserLocation}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 transition-all"
          >
            <Crosshair className="w-3.5 h-3.5" />
            <span className="truncate max-w-[160px] font-mono">{gpsStatus}</span>
          </button>

          {/* Platform Pills */}
          <div className="flex items-center gap-1.5 border-l border-slate-800/80 pl-3">
            {PLATFORMS.map((p) => (
              <button
                key={p}
                onClick={() => togglePlatform(p)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 shrink-0 ${
                  selectedPlatforms.includes(p)
                    ? 'bg-emerald-600 text-white shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                    : 'bg-slate-900/60 text-slate-400 border border-slate-800 hover:bg-slate-800'
                }`}
              >
                <span>{p}</span>
                <span className="text-[10px] font-mono opacity-80">({multipliers[p] || '1.0'}x)</span>
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="bg-[#060A14] border-b border-slate-800/80 px-4 py-3.5 z-20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2.5 gap-1">
          <span className="text-xs font-bold text-slate-200 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-emerald-400" />
            6-Hour Projected Regional Surge: <span className="text-emerald-400 font-black">{selectedHotspot.zoneName}</span>
          </span>
          <span className="text-[11px] text-slate-500 font-mono">Select any zone card below to refocus forecast</span>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
          {forecastData.map((item, idx) => (
            <div key={idx} className="bg-[#0A0E1A] border border-slate-800/80 rounded-xl p-2.5 text-center transition-all hover:border-slate-700 shadow-inner">
              <span className="text-[10px] font-mono text-slate-500 block">{item.time}</span>
              <span className={`text-sm font-black mt-0.5 block ${item.score > 85 ? 'text-red-400' : 'text-amber-400'}`}>
                {item.score}/100
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-4 p-4 z-20">
        <div className="lg:col-span-3 bg-[#090D18]/90 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-1 h-[420px] sm:h-[500px] lg:h-[600px] flex items-center justify-center relative overflow-hidden shadow-2xl">
          <SurgeMap 
            hotspots={hotspots} 
            userLocation={userLocation} 
            taxiStands={taxiStands}
            showTaxiStands={showTaxiStands}
          />
        </div>

        <div className="bg-[#090D18]/90 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-4 flex flex-col gap-4 shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <h2 className="font-bold text-xs md:text-sm text-white flex items-center gap-2">
              <Navigation className="w-4 h-4 text-emerald-400" />
              High-Earnings Surge Clusters
            </h2>
            <button onClick={fetchSurgeData} className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors">
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {userSurgeScore !== null && (
            <div className="bg-emerald-950/30 border border-emerald-800/40 p-3.5 rounded-xl text-xs shadow-inner">
              <span className="text-emerald-400 font-bold block text-[11px] tracking-wider uppercase font-mono">Your Location Demand Index:</span>
              <div className="text-3xl font-black text-emerald-400 mt-1 font-mono tracking-tight">{userSurgeScore} / 100</div>
            </div>
          )}

          <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 max-h-[380px] lg:max-h-[500px]">
            {hotspots.map((spot, idx) => {
              const activeMultipliers = selectedPlatforms.map(p => parseFloat(multipliers[p] || '1.0'));
              const highestMultiplier = activeMultipliers.length > 0 ? Math.max(...activeMultipliers) : 1.0;
              const estimatedGross4Seater = (spot.baseFare * highestMultiplier * weather.surgeMultiplier).toFixed(1);
              const estimated6Seater = (spot.avgDistanceKm * 2.0 * weather.surgeMultiplier).toFixed(0);
              const isSelected = selectedHotspot.zoneName === spot.zoneName;

              return (
                <div 
                  key={idx} 
                  onClick={() => setSelectedHotspot(spot)}
                  className={`bg-[#050811] border rounded-xl p-3.5 transition-all cursor-pointer ${
                    isSelected 
                      ? 'border-emerald-500/80 bg-emerald-950/20 shadow-[0_0_16px_rgba(16,185,129,0.12)]' 
                      : 'border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-xs md:text-sm text-slate-100 flex items-center gap-2">
                        {spot.zoneName}
                        {isSelected && <span className="text-[9px] bg-emerald-600 text-white px-2 py-0.2 rounded-full font-bold">ACTIVE</span>}
                      </h3>
                      <p className="text-[11px] text-slate-400 mt-0.5">{spot.reason}</p>
                      
                      {/* Standard Gross & Base Fare Row */}
                      <div className="flex items-center gap-2 mt-2.5 text-[10px] font-mono">
                        <span className="flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-2 py-0.5 rounded font-bold">
                          <DollarSign className="w-3 h-3 shrink-0" />
                          <span>Gross: S${estimatedGross4Seater}</span>
                        </span>
                        <span className="flex items-center gap-1 bg-slate-800/80 border border-slate-700/80 text-slate-400 px-2 py-0.5 rounded">
                          <Tag className="w-3 h-3 shrink-0 text-slate-500" />
                          <span>Base: S${spot.baseFare}</span>
                        </span>
                        <span className="flex items-center gap-1 bg-indigo-950/40 border border-indigo-800/40 text-indigo-300 px-2 py-0.5 rounded">
                          <Route className="w-3 h-3 shrink-0 text-indigo-400" />
                          <span>Avg: {spot.avgDistanceKm} km</span>
                        </span>
                      </div>

                      {/* Explicit 6-Seater & Minibus Rates Row */}
                      <div className="flex items-center gap-2 mt-1.5 text-[10px] font-mono">
                        <span className="flex items-center gap-1 bg-blue-950/50 border border-blue-800/50 text-blue-300 px-2 py-0.5 rounded">
                          <Car className="w-3 h-3 text-blue-400 shrink-0" />
                          <span>6-Seater: ~S${estimated6Seater} ($2/km)</span>
                        </span>
                        <span className="flex items-center gap-1 bg-amber-950/50 border border-amber-800/50 text-amber-300 px-2 py-0.5 rounded">
                          <Truck className="w-3 h-3 text-amber-400 shrink-0" />
                          <span>Minibus: S$40-60/job</span>
                        </span>
                      </div>
                    </div>

                    <div className="text-right shrink-0 ml-2">
                      <span className={`text-base md:text-xl font-black font-mono ${spot.score > 90 ? 'text-red-400' : spot.score > 80 ? 'text-amber-400' : 'text-emerald-400'}`}>
                        {Math.floor(spot.score * weather.surgeMultiplier)}
                      </span>
                      <span className="text-[9px] block text-slate-500 font-mono">/100</span>
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
