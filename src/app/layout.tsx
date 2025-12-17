import type { Metadata } from 'next';
import "./globals.css";

export const metadata: Metadata = {
  title: 'Samagam Transport Seva',
  description: 'Transport Logistics Management for the 59th Annual Samagam, Sangli.',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Since we have a root layout in [locale], this one is just a proxy
  return children;
}
