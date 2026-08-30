import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Surge Hunter — SG Ride-Hailing Monitor',
    short_name: 'Surge Hunter',
    description: 'Real-time ride-hailing demand and surge hunter for Singapore drivers.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0B1020',
    theme_color: '#3B82F6',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}