import { NextResponse } from 'next/server';
import axios from 'axios';

export async function GET() {
  const apiKey = process.env.LTA_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: 'LTA API Key missing' }, { status: 500 });
  }

  try {
    const [incidentsRes, taxisRes] = await Promise.all([
      axios.get('https://datamall2.mytransport.sg/ltaodataservice/TrafficIncidents', {
        headers: { AccountKey: apiKey, accept: 'application/json' },
        timeout: 8000,
      }),
      axios.get('https://datamall2.mytransport.sg/ltaodataservice/Taxi-Availability', {
        headers: { AccountKey: apiKey, accept: 'application/json' },
        timeout: 8000,
      }),
    ]);

    return NextResponse.json({
      incidents: incidentsRes.data.value || [],
      taxis: taxisRes.data.value || [],
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 502 });
  }
}