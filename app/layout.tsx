import './globals.css';
import type { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
  title: 'Баланс — учёт финансов',
  description: 'Локальный учёт доходов и расходов',
  manifest: '/manifest.webmanifest',
  icons: { icon: [{ url: '/favicon.ico' }, { url: '/favicon.svg', type: 'image/svg+xml' }], apple: [{ url: '/apple-touch-icon.png' }] },
  appleWebApp: { capable: true, statusBarStyle: 'black-translucent', title: 'Баланс' },
  formatDetection: { telephone: false }
};
export const viewport: Viewport = { width: 'device-width', initialScale: 1, maximumScale: 1, userScalable: false, viewportFit: 'cover', themeColor: '#000000' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="48x48" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Баланс" />
        <meta name="theme-color" content="#000000" />
      </head>
      <body className="bg-bg text-txt antialiased">{children}</body>
    </html>
  );
}