import { NextResponse } from 'next/server';

export async function GET() {
  // LTA DataMall API Endpoint Integration
  const LTA_API_KEY = process.env.LTA_DATAMALL_KEY;
  let trafficIncidents = [];

  if (LTA_API_KEY) {
    try {
      const res = await fetch('http://datamall2.mytransport.sg/ltaodataservice/TrafficIncidents', {
        headers: { AccountKey: LTA_API_KEY },
        next: { revalidate: 60 } // Cache for 1 minute
      });
      const data = await res.json();
      trafficIncidents = data.value || [];
    } catch (err) {
      console.error('LTA API Fetch Error:', err);
    }
  }

  // Simulated dynamic platform surge multipliers
  const platformSurges = {
    Grab: (1.2 + Math.random() * 0.8).toFixed(1),
    Gojek: (1.1 + Math.random() * 0.7).toFixed(1),
    TADA: (1.0 + Math.random() * 0.4).toFixed(1),
    Ryde: (1.1 + Math.random() * 0.5).toFixed(1),
  };

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    platformSurges,
    incidentsCount: trafficIncidents.length,
    incidents: trafficIncidents.slice(0, 5), // Top 5 recent incidents
  });
}