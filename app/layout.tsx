import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import './globals.css';

export const metadata: Metadata = {
  title: 'MILA | Luxury Fashion & Bags',
  description: 'Official Telegram Mini App for MILA fashion brand. Discover handcrafted luxury bags and exclusive collections.',
  icons: {
    icon: '/brand/logo.svg',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#ffffff',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="uz" className="light">
      <head>
        <Script
          src="https://telegram.org/js/telegram-web-app.js"
          strategy="beforeInteractive"
        />
      </head>
      <body className="min-h-screen bg-brand-bg text-brand-black antialiased selection:bg-brand-primary selection:text-white pb-24">
        {children}
      </body>
    </html>
  );
}
