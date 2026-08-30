import Script from 'next/script';
import './globals.css';

export const metadata = {
  title: 'Surge Hunter — Singapore Ride-Hailing Surge Finder',
  description: 'Find real-time Grab, Gojek, TADA, and Ryde surge hotspots in Singapore.',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Surge Hunter',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pubId = process.env.NEXT_PUBLIC_ADSENSE_PUB_ID;

  return (
    <html lang="en">
      <head>
        {pubId && (
          <Script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-${pubId}`}
            crossOrigin="anonymous"
            strategy="afterInteractive"
          />
        )}
      </head>
      <body className="bg-[#0B1020] text-slate-100 antialiased">
        {children}
      </body>
    </html>
  );
}