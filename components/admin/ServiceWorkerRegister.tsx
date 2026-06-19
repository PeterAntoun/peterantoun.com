'use client';

import { useEffect } from 'react';

/* Registers the PWA service worker once the dashboard mounts. Production only —
   a stale dev SW just gets in the way of HMR. Renders nothing. */
export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return;
    if (!('serviceWorker' in navigator)) return;
    const register = () =>
      navigator.serviceWorker.register('/sw.js').catch(() => {
        /* registration failures are non-fatal; the app still works online */
      });
    if (document.readyState === 'complete') register();
    else window.addEventListener('load', register, { once: true });
  }, []);

  return null;
}
