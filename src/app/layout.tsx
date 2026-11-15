import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import { siteConfig } from '@/config/site';

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
});
const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900',
});

export const metadata: Metadata = {
  title: siteConfig.title,
  description: siteConfig.description,
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bangers&family=Bungee&family=Chakra+Petch:wght@400;600;700&family=Cinzel:wght@400;700;900&family=Creepster&family=Dancing+Script:wght@400;700&family=Faster+One&family=Finger+Paint&family=Indie+Flower&family=Inter:wght@300;400;600;700&family=Itim&family=JetBrains+Mono:wght@400;700&family=Kanit:wght@300;400;600;700&family=Lora:ital,wght@0,400;0,700;1,400&family=Mitr:wght@400;600&family=Orbitron:wght@500;700;900&family=Permanent+Marker&family=Poppins:wght@300;400;600;700&family=Press+Start+2P&family=Prompt:wght@300;400;600;700&family=Roboto:wght@300;400;700&family=Sarabun:wght@300;400;600&family=Silkscreen:wght@400;700&family=Unbounded:wght@400;700;900&family=UnifrakturMaguntia&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#07080e] text-white selection:bg-purple-500/30 selection:text-white`}
      >
        {children}
      </body>
    </html>
  );
}
