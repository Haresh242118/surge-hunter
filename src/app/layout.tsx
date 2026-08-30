Set-Content -Path "src/app/layout.tsx" -Value @'
import './globals.css';

export const metadata = {
  title: 'Surge Hunter — SG Ride-Hailing Monitor',
  description: 'Real-time surge monitoring for Singapore drivers.',
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
'@ -Encoding utf8