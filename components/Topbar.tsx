'use client';

import { useState } from 'react';

const NAV_LINKS = [
  { label: 'Expertise', href: '#expertise' },
  { label: 'Education', href: '#education' },
  { label: 'Work',      href: '#work' },
];

export default function Topbar() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <>
      <header className="topbar">
        <div className="wrap">
          <a href="#top" className="brand" onClick={close}>
            <span className="dot" />
          </a>
          <nav className="nav">
            <span className="links">
              {NAV_LINKS.map(l => (
                <a key={l.href} href={l.href}>{l.label}</a>
              ))}
            </span>
            <a href="#contact" className="btn ghost btn-nav" style={{ padding: '9px 18px' }}>
              Get in touch
            </a>
            <a href="#contact" className="btn cta-desk" style={{ marginLeft: '8px' }}>
              Get in touch <span className="arr"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M7 17L17 7M9 7h8v8"/></svg></span>
            </a>
            <button
              className={`burger${open ? ' open' : ''}`}
              aria-label={open ? 'Close menu' : 'Open menu'}
              aria-expanded={open}
              onClick={() => setOpen(o => !o)}
            >
              <span /><span /><span />
            </button>
          </nav>
        </div>
      </header>

      <div className={`mobile-nav${open ? ' open' : ''}`} aria-hidden={!open}>
        <div className="mn-links">
          {NAV_LINKS.map(l => (
            <a key={l.href} href={l.href} onClick={close}>{l.label}</a>
          ))}
        </div>
        <div className="mn-cta">
          <a href="#contact" className="btn" onClick={close}>
            Get in touch
          </a>
        </div>
      </div>
    </>
  );
}
