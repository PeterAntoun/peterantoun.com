'use client';

import { useEffect } from 'react';

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ@#%&$01<>/';

function scramble(el: Element, duration = 900) {
  const finalText = el.getAttribute('data-text') || el.textContent || '';
  const start = performance.now();
  const len = finalText.length;

  function frame(now: number) {
    const p = Math.min(1, (now - start) / duration);
    const revealCount = Math.floor(p * len * 1.25);
    let out = '';
    for (let i = 0; i < len; i++) {
      const ch = finalText[i];
      if (ch === ' ') { out += ' '; continue; }
      if (i < revealCount) { out += ch; }
      else { out += CHARS[(Math.random() * CHARS.length) | 0]; }
    }
    el.textContent = out;
    if (p < 1) requestAnimationFrame(frame);
    else el.textContent = finalText;
  }
  requestAnimationFrame(frame);
}

export default function Animations() {
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // sticky topbar
    const topbar = document.querySelector('.topbar');
    const onScroll = () => topbar?.classList.toggle('stuck', window.scrollY > 12);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // scroll reveals
    const revs = document.querySelectorAll('[data-reveal]');
    let ioFired = false;
    if (reduce) {
      revs.forEach((el) => el.classList.add('in'));
    } else {
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) { ioFired = true; e.target.classList.add('in'); io.unobserve(e.target); }
          });
        },
        { threshold: 0.16, rootMargin: '0px 0px -8% 0px' },
      );
      revs.forEach((el) => io.observe(el));

      // fallback: reveal anything already in viewport after 1.4s if IO never fired
      setTimeout(() => {
        if (ioFired) return;
        revs.forEach((el) => {
          const r = el.getBoundingClientRect();
          if (r.top < window.innerHeight && r.bottom > 0) el.classList.add('in');
        });
        document.body.classList.add('force-show');
      }, 1400);
    }

    // name reveal
    requestAnimationFrame(() => {
      requestAnimationFrame(() => { document.body.classList.add('loaded'); });
    });

    // scramble
    const scramblers = document.querySelectorAll('[data-scramble]');
    scramblers.forEach((el) => {
      el.setAttribute('data-text', el.textContent?.trim() || '');
    });

    if (!reduce) {
      const busy = new WeakSet<Element>();
      scramblers.forEach((el) => {
        const so = new IntersectionObserver(
          (entries) => {
            entries.forEach((e) => {
              if (e.isIntersecting) { scramble(e.target, 700); so.unobserve(e.target); }
            });
          },
          { threshold: 0.6 },
        );
        so.observe(el);

        el.addEventListener('mouseenter', () => {
          if (!busy.has(el)) {
            busy.add(el);
            scramble(el, 550);
            setTimeout(() => busy.delete(el), 560);
          }
        });
      });
    }

    // smooth in-page nav
    document.querySelectorAll('a[href^="#"]').forEach((a) => {
      a.addEventListener('click', (e) => {
        const id = a.getAttribute('href');
        if (!id || id.length <= 1) return;
        const target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        const headerH = (topbar ? (topbar as HTMLElement).offsetHeight : 68) + 22;
        const rectTop = target.getBoundingClientRect().top + window.scrollY;
        const secH = (target as HTMLElement).offsetHeight;
        const vh = window.innerHeight;
        const offset = rectTop - Math.max(headerH, (vh - secH) / 2);
        window.scrollTo({ top: Math.max(0, offset), behavior: 'smooth' });
      });
    });

    return () => {
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  return null;
}
