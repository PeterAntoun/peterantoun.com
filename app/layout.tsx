import type { Metadata } from 'next';
import './globals.css';

const siteUrl = 'https://peterantoun.com';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: 'Peter Antoun — Data-Driven Growth',
  description:
    'Peter Antoun — Data & AI student and builder based in Paris. Analytics pipelines, AI agents, and tools that turn data into decisions.',
  keywords: ['Peter Antoun', 'Data', 'AI', 'Growth', 'Analytics', 'Paris', 'Portfolio'],
  authors: [{ name: 'Peter Antoun', url: siteUrl }],
  creator: 'Peter Antoun',
  alternates: { canonical: siteUrl },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteUrl,
    siteName: 'Peter Antoun',
    title: 'Peter Antoun — Data-Driven Growth',
    description: 'Data & AI student and builder. Analytics pipelines, AI agents, and tools that scale brands.',
    images: [{ url: '/og.png', width: 1200, height: 630, alt: 'Peter Antoun' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Peter Antoun — Data-Driven Growth',
    description: 'Data & AI student and builder based in Paris.',
    images: ['/og.png'],
  },
  robots: { index: true, follow: true },
  icons: { icon: '/favicon.svg' },
};

const themeInit = `(function(){try{var t=localStorage.getItem('pa-theme');document.documentElement.setAttribute('data-theme',t==='dark'?'dark':'light');}catch(e){document.documentElement.setAttribute('data-theme','light');}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,300..800&family=JetBrains+Mono:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
