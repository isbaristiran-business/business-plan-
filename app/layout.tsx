import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Ledger · Portfolio Tracker',
  description: 'Track your investments with live market data',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
