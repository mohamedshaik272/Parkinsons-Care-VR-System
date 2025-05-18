import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Parkinson's Disease Monitoring Portal",
  description: 'A comprehensive platform for monitoring and managing Parkinson\'s disease progression',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
} 