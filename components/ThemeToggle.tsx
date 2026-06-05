'use client';

import { useCallback, useSyncExternalStore } from 'react';

type Theme = 'light' | 'dark';

// The DOM (`.dark` on <html>) is the source of truth. useSyncExternalStore lets
// us read it during hydration without a setState-in-effect or a flash, and React
// reconciles the server/client snapshots for us.
function subscribe(callback: () => void) {
  window.addEventListener('themechange', callback);
  window.addEventListener('storage', callback);
  return () => {
    window.removeEventListener('themechange', callback);
    window.removeEventListener('storage', callback);
  };
}

function getSnapshot(): Theme {
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
}

// Matches the inline init script's fallback so the first paint is consistent.
function getServerSnapshot(): Theme {
  return 'dark';
}

export default function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const isDark = theme === 'dark';

  const toggle = useCallback(() => {
    const next: Theme = document.documentElement.classList.contains('dark')
      ? 'light'
      : 'dark';
    document.documentElement.classList.toggle('dark', next === 'dark');
    try {
      localStorage.setItem('theme', next);
    } catch {
      /* storage may be unavailable (private mode) — DOM class still applies */
    }
    window.dispatchEvent(new Event('themechange'));
  }, []);

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      title={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      className="grid h-9 w-9 place-items-center rounded-lg border border-line/15 text-fg transition-colors hover:bg-fg/5"
    >
      <span aria-hidden>{isDark ? <SunIcon /> : <MoonIcon />}</span>
    </button>
  );
}

function SunIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}
