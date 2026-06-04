import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const siteUrl = 'https://peterantoun.com';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Peter Antoun — Data & AI',
    template: '%s · Peter Antoun',
  },
  description:
    'Peter Antoun (Baba) — Data & AI student and builder. I build analytics pipelines, AI agents, and tools with data, Python, SQL, and Next.js. Based in Paris.',
  keywords: [
    'Peter Antoun',
    'Data & AI',
    'AI Agents',
    'Data Analytics',
    'Next.js',
    'Snowflake',
    'Python',
    'Paris',
    'Portfolio',
  ],
  authors: [{ name: 'Peter Antoun', url: siteUrl }],
  creator: 'Peter Antoun',
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteUrl,
    siteName: 'Peter Antoun',
    title: 'Peter Antoun — Data & AI',
    description:
      'Data & AI student and builder. Analytics pipelines, AI agents, and tools built with data, Python, SQL, and Next.js.',
    images: [
      {
        // Placeholder — drop a 1200×630 image at /public/og.png to replace.
        url: '/og.png',
        width: 1200,
        height: 630,
        alt: 'Peter Antoun — Data & AI',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Peter Antoun — Data & AI',
    description:
      'Data & AI student and builder. I build things with data and AI.',
    images: ['/og.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: '/favicon.svg',
  },
};

export const viewport: Viewport = {
  themeColor: '#08090c',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}
