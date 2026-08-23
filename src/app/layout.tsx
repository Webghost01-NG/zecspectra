import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ZecSpectra | Zcash Protocol Telemetry & RPC Studio',
  description: 'Live real-time telemetry, shielded pool distribution, and interactive RPC Studio directly connected to the Zcash Network.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-zinc-950 text-zinc-100 antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
