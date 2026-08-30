import './globals.css';

export const metadata = {
  title: 'Surge Hunter — Singapore Ride-Hailing Surge Finder',
  description: 'Find real-time Grab, Gojek, TADA, and Ryde surge hotspots in Singapore.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#0B1020] text-slate-100 antialiased">
        {children}
      </body>
    </html>
  );
}
