'use client';

import { useEffect } from 'react';

interface AdBannerProps {
  dataAdSlot: string;
}

export default function AdBanner({ dataAdSlot }: AdBannerProps) {
  useEffect(() => {
    try {
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (error) {
      console.error('AdSense error:', error);
    }
  }, []);

  return (
    <div className="my-2 flex justify-center overflow-hidden rounded-lg bg-[#0B1020]/60 p-2 border border-slate-800">
      <ins
        className="adsbygoogle"
        style={{ display: 'block', width: '100%' }}
        data-ad-client={`ca-pub-${process.env.NEXT_PUBLIC_ADSENSE_PUB_ID}`}
        data-ad-slot={dataAdSlot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}