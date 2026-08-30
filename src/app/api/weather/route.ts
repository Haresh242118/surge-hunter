import { NextResponse } from 'next/server';

export async function GET() {
  const apiKey = process.env.NEA_API_KEY;
  
  try {
    const res = await fetch('https://api.data.gov.sg/v1/environment/2-hour-weather-forecast', {
      headers: apiKey ? { 'api-key': apiKey } : {},
      next: { revalidate: 300 } // Cache for 5 minutes
    });

    if (!res.ok) throw new Error('NEA API response error');

    const data = await res.json();
    const items = data.items?.[0] || {};
    const forecasts = items.forecasts || [];
    
    // Check general weather condition across Singapore
    const isRaining = forecasts.some((f: any) => 
      /rain|showers|thunder/i.test(f.forecast)
    );

    const mainCondition = isRaining ? 'Thundery Showers' : 'Partly Cloudy';
    const surgeMultiplier = isRaining ? 1.25 : 1.0;

    return NextResponse.json({
      condition: mainCondition,
      isRaining,
      surgeMultiplier,
      forecasts,
      updatedAt: items.valid_period?.text || new Date().toLocaleTimeString(),
    });
  } catch (error) {
    console.error('NEA API Error:', error);
    // Fallback response if API key is invalid or offline
    return NextResponse.json({
      condition: 'Passing Showers',
      isRaining: true,
      surgeMultiplier: 1.15,
      forecasts: [],
      updatedAt: new Date().toLocaleTimeString(),
    });
  }
}