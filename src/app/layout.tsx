import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';

export const metadata: Metadata = {
  title: 'Surge Hunter — SG Ride-Hailing Demand',
  description: 'Real-time Singapore ride-hailing demand & surge monitor',
  manifest: '/manifest.json',
  themeColor: '#0B1020',
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
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/72x72/1f3af.png" />
        <meta name="mobile-web-app-capable" content="yes" />

        {/* Google AdSense Script - Replace ca-pub-XXXXXXXXXXXXXXXX with your actual Publisher ID */}
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1788007656485643"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
