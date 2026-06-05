'use client';

import { motion } from 'framer-motion';
import { staggerContainer, fadeUp } from '@/lib/motion';

export default function Hero() {
  return (
    <section
      id="hero"
      className="relative flex min-h-[100svh] items-center overflow-hidden pt-16"
    >
      <AnimatedBackground />

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        className="container-px relative z-10"
      >
        <motion.p
          variants={fadeUp}
          className="mb-5 inline-flex items-center gap-2 rounded-full border border-line/15 bg-fg/5 px-3 py-1 text-xs text-muted"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent-cyan opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-accent-cyan" />
          </span>
          Available for 2026 — Data &amp; AI roles
        </motion.p>

        <motion.h1
          variants={fadeUp}
          className="max-w-4xl text-4xl font-semibold leading-[1.05] tracking-tight text-fg sm:text-6xl lg:text-7xl"
        >
          I build things with{' '}
          <span className="bg-gradient-to-r from-accent via-accent-cyan to-accent bg-[length:200%_auto] bg-clip-text text-transparent animate-gradient-pan">
            data and AI
          </span>
          .
        </motion.h1>

        <motion.p
          variants={fadeUp}
          className="mt-6 max-w-xl text-base text-muted sm:text-lg"
        >
          I&apos;m Peter Antoun — friends call me Baba. A Data &amp; AI student
          and builder based in Paris, shipping analytics pipelines, AI agents,
          and tools that turn messy data into decisions.
        </motion.p>

        <motion.div
          variants={fadeUp}
          className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center"
        >
          <a
            href="#projects"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-accent px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
          >
            See my work
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </a>
          <a
            href="/cv.pdf"
            download
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-line/15 bg-fg/5 px-6 py-3 text-sm font-medium text-fg transition-colors hover:border-line/25 hover:bg-fg/10"
          >
            Download CV
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M12 3v12M7 10l5 5 5-5M5 21h14" />
            </svg>
          </a>
        </motion.div>

        <motion.div
          variants={fadeUp}
          className="mt-12 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-subtle"
        >
          <span>📍 Paris, France</span>
          <span>🇱🇧 Lebanese</span>
          <span>🗣 English · French · Arabic</span>
        </motion.div>
      </motion.div>

      {/* Scroll cue */}
      <div className="absolute bottom-8 left-1/2 z-10 hidden -translate-x-1/2 sm:block">
        <div className="flex h-9 w-5 items-start justify-center rounded-full border border-line/20 p-1">
          <span className="h-2 w-1 animate-float rounded-full bg-accent-cyan" />
        </div>
      </div>
    </section>
  );
}

/**
 * Subtle animated background — a slow-drifting gradient plus a handful of
 * floating particles. Pure CSS/SVG, no canvas, so it stays cheap on mobile.
 */
function AnimatedBackground() {
  const particles = [
    { left: '12%', top: '24%', size: 4, delay: 0 },
    { left: '78%', top: '18%', size: 6, delay: 1.2 },
    { left: '64%', top: '62%', size: 3, delay: 2.1 },
    { left: '32%', top: '72%', size: 5, delay: 0.6 },
    { left: '88%', top: '48%', size: 3, delay: 1.8 },
    { left: '46%', top: '36%', size: 2, delay: 2.6 },
  ];

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Drifting accent blobs */}
      <div className="absolute -left-32 top-10 h-96 w-96 rounded-full bg-accent/20 blur-[120px]" />
      <div className="absolute -right-24 bottom-0 h-96 w-96 rounded-full bg-accent-cyan/15 blur-[120px]" />

      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.18]"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(148,163,184,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(148,163,184,0.08) 1px, transparent 1px)',
          backgroundSize: '56px 56px',
          maskImage:
            'radial-gradient(ellipse 80% 60% at 50% 40%, black 40%, transparent 100%)',
          WebkitMaskImage:
            'radial-gradient(ellipse 80% 60% at 50% 40%, black 40%, transparent 100%)',
        }}
      />

      {/* Floating particles */}
      {particles.map((p, i) => (
        <span
          key={i}
          className="absolute animate-float rounded-full bg-accent-cyan/60"
          style={{
            left: p.left,
            top: p.top,
            width: p.size,
            height: p.size,
            animationDelay: `${p.delay}s`,
            boxShadow: '0 0 12px rgba(6,182,212,0.6)',
          }}
        />
      ))}
    </div>
  );
}
