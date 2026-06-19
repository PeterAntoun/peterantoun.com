import type { MetadataRoute } from 'next';

/* PWA manifest. The installable app is the private finance dashboard, so it
   launches into /admin (the auth middleware sends you to login if needed). One
   manifest per origin — kept Finance-branded by design. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Finance — Private',
    short_name: 'Finance',
    description: 'Private net-worth, cash-flow and P&L tracker.',
    id: '/admin',
    start_url: '/admin',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#101010',
    theme_color: '#101010',
    categories: ['finance', 'productivity'],
    icons: [
      { src: '/icon.svg', type: 'image/svg+xml', sizes: 'any', purpose: 'any' },
      { src: '/icons/192', type: 'image/png', sizes: '192x192', purpose: 'any' },
      { src: '/icons/512', type: 'image/png', sizes: '512x512', purpose: 'any' },
      { src: '/icons/512', type: 'image/png', sizes: '512x512', purpose: 'maskable' },
    ],
  };
}
