import { NextResponse } from 'next/server';

export async function GET() {
  const LTA_API_KEY = process.env.LTA_DATAMALL_KEY;

  // Fallback LTA Taxi Stands (Red Markers)
  const taxiStands = [
    { TaxiCode: 'T3-TAX', Name: 'Changi Airport T3 Main Taxi Bay', Latitude: 1.3560, Longitude: 103.9870, type: 'taxi' },
    { TaxiCode: 'MBS-TAX', Name: 'Marina Bay Sands Taxi Stand (Tower 1)', Latitude: 1.2834, Longitude: 103.8607, type: 'taxi' },
    { TaxiCode: 'ION-TAX', Name: 'ION Orchard Official Taxi Stand (E1)', Latitude: 1.3048, Longitude: 103.8318, type: 'taxi' },
    { TaxiCode: 'VIVO-TAX', Name: 'VivoCity Taxi Stand (F12)', Latitude: 1.2644, Longitude: 103.8222, type: 'taxi' },
    { TaxiCode: 'JUR-TAX', Name: 'Jurong East MRT Taxi Stand (J01)', Latitude: 1.3329, Longitude: 103.7436, type: 'taxi' },
    { TaxiCode: 'WDL-TAX', Name: 'Woodlands Checkpoint Taxi Stand', Latitude: 1.4423, Longitude: 103.7698, type: 'taxi' },
  ];

  // Designated PHV Pickup Points (Blue Markers)
  const phvPickups = [
    { TaxiCode: 'T3-PHV', Name: 'Changi Airport T3 Doors 1-3 (PHV Pickup)', Latitude: 1.3572, Longitude: 103.9882, type: 'phv' },
    { TaxiCode: 'MBS-PHV', Name: 'MBS Convention Centre Driveway (PHV Bay)', Latitude: 1.2842, Longitude: 103.8592, type: 'phv' },
    { TaxiCode: 'ORC-PHV', Name: 'Wisma Atria PHV Drop/Pickup Point', Latitude: 1.3039, Longitude: 103.8331, type: 'phv' },
    { TaxiCode: 'VIVO-PHV', Name: 'VivoCity Passenger Loading Bay B (PHV)', Latitude: 1.2652, Longitude: 103.8210, type: 'phv' },
    { TaxiCode: 'JUR-PHV', Name: 'JGem PHV Passenger Pickup Bay', Latitude: 1.3338, Longitude: 103.7425, type: 'phv' },
    { TaxiCode: 'WDL-PHV', Name: 'Woodlands Train Checkpoint PHV Bay', Latitude: 1.4435, Longitude: 103.7682, type: 'phv' },
  ];

  if (LTA_API_KEY) {
    try {
      const res = await fetch('http://datamall2.mytransport.sg/ltaodataservice/TaxiStands', {
        headers: { AccountKey: LTA_API_KEY },
        next: { revalidate: 3600 }
      });
      const data = await res.json();
      if (data.value && data.value.length > 0) {
        const liveTaxis = data.value.map((item: any) => ({ ...item, type: 'taxi' }));
        return NextResponse.json({ pickupPoints: [...liveTaxis, ...phvPickups] });
      }
    } catch (err) {
      console.error('LTA API Error:', err);
    }
  }

  return NextResponse.json({ pickupPoints: [...taxiStands, ...phvPickups] });
}
