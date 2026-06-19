/* Finance PWA service worker.
   Deliberately conservative: this is a private, always-changing financial app,
   so we NEVER serve cached dashboard data. Strategy:
   - non-GET (server actions, logout, mutations): bypass entirely.
   - navigations: network-first, falling back to a cached /offline page only
     when truly offline.
   - hashed static build assets: cache-first (they are content-addressed and
     immutable, so this is always safe).
   Everything else goes straight to the network. */
const CACHE = 'fin-cache-v1';
const OFFLINE_URL = '/offline';

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE).then((c) => c.add(OFFLINE_URL)));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)));
      await self.clients.claim();
    })(),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // App-shell navigations: always try the network; only fall back when offline.
  if (request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          return await fetch(request);
        } catch {
          const cache = await caches.open(CACHE);
          return (await cache.match(OFFLINE_URL)) || Response.error();
        }
      })(),
    );
    return;
  }

  // Immutable, content-hashed build output: safe to cache-first.
  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(CACHE);
        const hit = await cache.match(request);
        if (hit) return hit;
        const res = await fetch(request);
        if (res.ok) cache.put(request, res.clone());
        return res;
      })(),
    );
  }
});
