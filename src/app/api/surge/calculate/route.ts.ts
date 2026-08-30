import { NextResponse } from 'next/server';

export async function GET() {
  // Simulated backend engine data synthesis
  const hotspots = [
    {
      code: 'orchard',
      zoneName: 'Orchard Road',
      score: 88,
      demand: 92,
      traffic: 74,
      lat: 1.3048,
      lng: 103.8318,
      reason: 'High historical demand + heavy evening traffic',
      platformBreakdown: { Grab: 'HIGH', Gojek: 'MEDIUM', TADA: 'HIGH', Ryde: 'MEDIUM' }
    },
    {
      code: 'marina_bay',
      zoneName: 'Marina Bay Sands & CBD',
      score: 92,
      demand: 95,
      traffic: 80,
      lat: 1.2834,
      lng: 103.8585,
      reason: 'Event outflow + high commercial demand',
      platformBreakdown: { Grab: 'HIGH', Gojek: 'HIGH', TADA: 'HIGH', Ryde: 'HIGH' }
    },
    {
      code: 'changi_airport',
      zoneName: 'Changi Airport T1-T4',
      score: 94,
      demand: 98,
      traffic: 40,
      lat: 1.3644,
      lng: 103.9915,
      reason: 'Multiple international flight arrivals',
      platformBreakdown: { Grab: 'HIGH', Gojek: 'MEDIUM', TADA: 'HIGH', Ryde: 'MEDIUM' }
    }
  ];

  return NextResponse.json({
    status: 'success',
    is_demo: true,
    overall_score: 91,
    hotspots
  });
}