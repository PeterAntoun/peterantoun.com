'use client';

import { useEffect, useState } from 'react';

export default function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.getAttribute('data-theme') === 'dark');
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    const t = next ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', t);
    try { localStorage.setItem('pa-theme', t); } catch {}
  }

  return (
    <button
      className="theme-toggle"
      type="button"
      aria-label={dark ? 'Switch to light theme' : 'Switch to dark theme'}
      title="Toggle theme"
      onClick={toggle}
    >
      <span className="ic" />
    </button>
  );
}
