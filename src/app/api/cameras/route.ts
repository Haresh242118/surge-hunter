import { NextResponse } from 'next/server';

export async function GET() {
  const LTA_API_KEY = process.env.LTA_DATAMALL_KEY;

  if (LTA_API_KEY) {
    try {
      const res = await fetch('http://datamall2.mytransport.sg/ltaodataservice/Traffic-Imagesv2', {
        headers: { AccountKey: LTA_API_KEY },
        next: { revalidate: 60 },
      });
      const data = await res.json();
      if (data.value && data.value.length > 0) {
        return NextResponse.json({ cameras: data.value });
      }
    } catch (err) {
      console.error('LTA Traffic Camera Fetch Error:', err);
    }
  }

  // Live Fallback Feeds via data.gov.sg (Public API - No key required)
  try {
    const govRes = await fetch('https://api.data.gov.sg/v1/transport/traffic-images', {
      next: { revalidate: 60 },
    });
    const govData = await govRes.json();
    const cameraItems = govData.items?.[0]?.cameras || [];

    const formattedCams = cameraItems.map((c: any) => ({
      CameraID: c.camera_id,
      ImageURL: c.image,
      Latitude: c.location.latitude,
      Longitude: c.location.longitude,
    }));

    return NextResponse.json({ cameras: formattedCams });
  } catch (govErr) {
    console.error('Gov SG Camera API Error:', govErr);
    return NextResponse.json({ cameras: [] });
  }
}