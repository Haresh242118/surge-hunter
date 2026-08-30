'use client';

import React, { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { AlertTriangle, Navigation, RefreshCw, Crosshair, TrendingUp, DollarSign, Zap, Volume2, VolumeX, Download, Users, Camera, Bell, BarChart3 } from 'lucide-react';

const SurgeMap = dynamic(() => import('../components/Map'), { 
  ssr: false, 
  loading: () => <div className="h-[350px] md:h-[520px] flex items-center justify-center text-slate-500 text-sm animate-pulse">Loading OpenStreetMap...</div> 
});

const PLATFORMS = ['Grab', 'Gojek', 'TADA', 'Ryde'];

const INITIAL_HOTSPOTS = [
  { zoneName: 'Changi Airport T3', reason: 'High incoming international arrivals', score: 94, lat: 1.3560, lng: 103.9870, baseFare: 14 },
  { zoneName: 'Marina Bay Sands', reason: 'Event & casino crowd dispersion', score: 88, lat: 1.2834, lng: 103.8607, baseFare: 11 },
  { zoneName: 'Orchard Road', reason: 'Peak shopping & dining hours', score: 82, lat: 1.3048, lng: 103.8318, baseFare: 10 },
  { zoneName: 'VivoCity & Sentosa Gateway', reason: 'Weekend island traffic bottleneck', score: 85, lat: 1.2644, lng: 103.8222, baseFare: 12 },
  { zoneName: 'Jurong East Central', reason: 'Commuter interchange rush hour', score: 78, lat: 1.3329, lng: 103.7436, baseFare: 13 },
  { zoneName: 'Woodlands Checkpoint', reason: 'Cross-border causeway congestion', score: 91, lat: 1.4423, lng: 103.7698, baseFare: 18 },
  { zoneName: 'Suntec City & Convention Centre', reason: 'Exhibition & business peak exit', score: 80, lat: 1.2933, lng: 103.8572, baseFare: 10 },
  { zoneName: 'Clarke Quay', reason: 'Nightlife & dining pickup surge', score: 89, lat: 1.2906, lng: 103.8465, baseFare: 11 },
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
  const [selectedHotspot, setSelectedHotspot] = useState(INITIAL_HOTSPOTS[0]);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [userSurgeScore, setUserSurgeScore] = useState<number | null>(null);
  const [gpsStatus, setGpsStatus] = useState<string>('Detecting Location...');
  const [loading, setLoading] = useState<boolean>(false);
  const [multipliers, setMultipliers] = useState<Record<string, string>>({ Grab: '1.2', Gojek: '1.1', TADA: '1.0', Ryde: '1.1' });
  const [audioEnabled, setAudioEnabled] = useState<boolean>(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [onlineUsers, setOnlineUsers] = useState<number>(14);

  // Dynamic Location-Based 6-Hour Forecast Generator
  const getForecastForZone = useCallback((baseScore: number) => {
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date();
      d.setHours(d.getHours() + i + 1);
      const fluctuation = Math.floor(Math.sin(i + baseScore) * 12);
      const score = Math.min(99, Math.max(50, baseScore + fluctuation));
      return {
        time: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        score,
      };
    });
  }, []);

  const forecastData = getForecastForZone(selectedHotspot.score);

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
    const interval = setInterval(fetchOnlineCount, 10000);
    return () => clearInterval(interval);
  }, []);

  const enablePushNotifications = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        setNotificationsEnabled(true);
        new Notification('🎯 Surge Hunter Alerts Enabled', {
          body: 'You will receive push notifications when surge scores exceed 90.',
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
      const res = await fetch('/api/surge');
      const data = await res.json();
      if (data.platformSurges) {
        setMultipliers(data.platformSurges);
        speakNotification('Updated surge zones.');

        if (notificationsEnabled && 'Notification' in window && Notification.permission === 'granted') {
          const criticalSpot = hotspots.find(h => h.score >= 90);
          if (criticalSpot) {
            new Notification(`🚨 Surge Alert: ${criticalSpot.zoneName}`, {
              body: `Surge Score reached ${criticalSpot.score}/100. High demand active.`,
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

  const highDemandZones = hotspots.filter(h => h.score >= 85);

  return (
    <main className="min-h-screen bg-[#0B1020] text-slate-100 flex flex-col font-sans overflow-x-hidden">
      <div className="bg-amber-500/10 border-b border-amber-500/30 text-amber-400 px-3 md:px-4 py-2 text-[11px] md:text-xs font-semibold flex items-center justify-between">
        <div className="flex items-center gap-2 truncate pr-2">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">SURGE HUNTER LIVE — Monitoring Active Demand ({hotspots.length} Zones)</span>
        </div>
        
        <div className="flex items-center gap-1.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded text-[10px] shrink-0 font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <Users className="w-3 h-3" />
          <span>{onlineUsers} Online</span>
        </div>
      </div>

      <div className="bg-[#0f172a] border-b border-slate-800 py-1.5 px-3 md:px-4 overflow-hidden flex items-center gap-2 md:gap-3 text-xs">
        <div className="flex items-center gap-1 text-red-400 font-bold bg-red-500/10 px-1.5 py-0.5 rounded border border-red-500/20 text-[10px] md:text-xs whitespace-nowrap shrink-0 z-10">
          <Zap className="w-3 h-3 fill-red-400 animate-bounce" />
          <span>ALERT</span>
        </div>
        
        <div className="flex-1 overflow-hidden relative">
          <div className="animate-marquee whitespace-nowrap flex gap-6 md:gap-8 items-center text-slate-300 text-[11px] md:text-xs">
            {highDemandZones.concat(highDemandZones).map((spot, i) => (
              <span key={i} className="flex items-center gap-1.5 md:gap-2">
                <span className="font-semibold text-white">{spot.zoneName}</span>
                <span className="text-slate-400 hidden sm:inline">({spot.reason})</span>
                <span className="text-red-400 font-black">Score: {spot.score}</span>
                <span className="text-slate-600">|</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      <header className="border-b border-slate-800 bg-[#151B2E] px-4 md:px-6 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg md:text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-blue-500 animate-pulse"></span>
            🎯 Surge Hunter
          </h1>
          <p className="text-[11px] md:text-xs text-slate-400">Singapore Ride-Hailing Demand & Surge Monitor</p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Link
            href="/cameras"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] md:text-xs font-semibold bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-700 transition-all"
          >
            <Camera className="w-3.5 h-3.5 text-blue-400" />
            <span>Traffic Cams</span>
          </Link>

          <button
            onClick={enablePushNotifications}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] md:text-xs font-semibold border transition-all ${
              notificationsEnabled 
                ? 'bg-amber-600/20 text-amber-400 border-amber-500/30' 
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            <span>{notificationsEnabled ? 'Alerts On' : 'Push Alerts'}</span>
          </button>

          <button
            onClick={handleInstallClick}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] md:text-xs font-semibold bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-600/30 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Install App</span>
          </button>

          <button
            onClick={() => setAudioEnabled(!audioEnabled)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] md:text-xs font-semibold border transition-all ${
              audioEnabled 
                ? 'bg-blue-600/20 text-blue-400 border-blue-500/30 hover:bg-blue-600/30' 
                : 'bg-slate-800 text-slate-500 border-slate-700 hover:bg-slate-700'
            }`}
          >
            {audioEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span>{audioEnabled ? 'Audio On' : 'Muted'}</span>
          </button>

          <button
            onClick={getUserLocation}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] md:text-xs font-semibold bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-600/30 transition-all"
          >
            <Crosshair className="w-3.5 h-3.5" />
            <span className="truncate max-w-[180px] md:max-w-none">{gpsStatus}</span>
          </button>

          <div className="flex items-center gap-1.5 border-l border-slate-700 pl-2 sm:pl-3 overflow-x-auto py-0.5 max-w-full">
            {PLATFORMS.map((p) => (
              <button
                key={p}
                onClick={() => togglePlatform(p)}
                className={`px-2.5 py-1 rounded-lg text-[11px] md:text-xs font-semibold transition-all flex items-center gap-1 shrink-0 ${
                  selectedPlatforms.includes(p)
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700'
                }`}
              >
                <span>{p}</span>
                <span className="text-[9px] md:text-[10px] opacity-80">({multipliers[p] || '1.0'}x)</span>
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Location-Specific Predictive Demand Forecast Bar */}
      <div className="bg-[#151B2E] border-b border-slate-800 px-4 py-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 gap-1">
          <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
            <BarChart3 className="w-4 h-4 text-blue-400" />
            Forecast for: <span className="text-blue-400 underline">{selectedHotspot.zoneName}</span>
          </span>
          <span className="text-[10px] text-slate-400">(Click any hotspot below to switch location)</span>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {forecastData.map((item, idx) => (
            <div key={idx} className="bg-[#0B1020] border border-slate-800 rounded-lg p-2 text-center">
              <span className="text-[10px] text-slate-400 block">{item.time}</span>
              <span className={`text-xs font-black ${item.score > 85 ? 'text-red-400' : 'text-amber-400'}`}>
                {item.score}/100
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-4 p-3 md:p-4">
        <div className="lg:col-span-3 bg-[#151B2E] border border-slate-800 rounded-xl p-1 h-[380px] sm:h-[450px] lg:h-[550px] flex items-center justify-center relative overflow-hidden">
          <SurgeMap hotspots={hotspots} userLocation={userLocation} />
        </div>

        <div className="bg-[#151B2E] border border-slate-800 rounded-xl p-3.5 md:p-4 flex flex-col gap-3 md:gap-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <h2 className="font-bold text-xs md:text-sm text-white flex items-center gap-2">
              <Navigation className="w-4 h-4 text-blue-400" />
              High Demand Hotspots
            </h2>
            <button onClick={fetchSurgeData} className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors">
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {userSurgeScore !== null && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 p-2.5 md:p-3 rounded-lg text-xs">
              <span className="text-emerald-400 font-bold block text-[11px]">Your Location Surge Score:</span>
              <div className="text-xl md:text-2xl font-black text-emerald-400 mt-0.5">{userSurgeScore} / 100</div>
            </div>
          )}

          <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 max-h-[350px] lg:max-h-[460px]">
            {hotspots.map((spot, idx) => {
              const activeMultipliers = selectedPlatforms.map(p => parseFloat(multipliers[p] || '1.0'));
              const lowestMultiplier = activeMultipliers.length > 0 ? Math.min(...activeMultipliers) : 1.0;
              const estimatedFare = (spot.baseFare * lowestMultiplier).toFixed(1);
              const isSelected = selectedHotspot.zoneName === spot.zoneName;

              return (
                <div 
                  key={idx} 
                  onClick={() => setSelectedHotspot(spot)}
                  className={`bg-[#0B1020] border rounded-lg p-2.5 md:p-3 transition-colors cursor-pointer ${
                    isSelected ? 'border-blue-500 bg-blue-950/20 shadow-lg shadow-blue-500/10' : 'border-slate-800 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-xs md:text-sm text-slate-200 flex items-center gap-1.5">
                        {spot.zoneName}
                        {isSelected && <span className="text-[9px] bg-blue-600 text-white px-1.5 py-0.2 rounded">Forecasted</span>}
                      </h3>
                      <p className="text-[10px] md:text-[11px] text-slate-400 mt-0.5">{spot.reason}</p>
                      <div className="flex items-center gap-2 mt-1.5 text-[10px] md:text-[11px] text-slate-300">
                        <span className="flex items-center text-emerald-400 font-semibold">
                          <DollarSign className="w-3 h-3" /> Est: S${estimatedFare}
                        </span>
                        <span className="flex items-center text-slate-500">
                          <TrendingUp className="w-3 h-3 mr-0.5" /> Base S${spot.baseFare}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`text-base md:text-lg font-black ${spot.score > 90 ? 'text-red-400' : spot.score > 80 ? 'text-amber-400' : 'text-blue-400'}`}>
                        {spot.score}
                      </span>
                      <span className="text-[9px] md:text-[10px] block text-slate-500">/100</span>
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
