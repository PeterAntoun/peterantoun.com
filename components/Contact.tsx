'use client';

import { useState, type FormEvent } from 'react';
import { motion } from 'framer-motion';
import { staggerContainer, fadeUp, revealOnce } from '@/lib/motion';

type Status = 'idle' | 'sending' | 'success' | 'error';

const SOCIALS = [
  {
    label: 'Email',
    value: 'hello@peterantoun.com',
    href: 'mailto:hello@peterantoun.com',
  },
  {
    label: 'LinkedIn',
    value: 'in/peterantoun',
    href: 'https://www.linkedin.com/in/peterantoun',
  },
  {
    label: 'GitHub',
    value: '@peterantoun',
    href: 'https://github.com/peterantoun',
  },
];

export default function Contact() {
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('sending');
    setError(null);

    const form = e.currentTarget;
    const data = new FormData(form);
    const payload = {
      name: String(data.get('name') ?? ''),
      email: String(data.get('email') ?? ''),
      message: String(data.get('message') ?? ''),
      company: String(data.get('company') ?? ''), // honeypot
    };

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as
          | { error?: string }
          | null;
        throw new Error(body?.error ?? 'Something went wrong.');
      }

      setStatus('success');
      form.reset();
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    }
  }

  return (
    <section
      id="contact"
      className="scroll-mt-20 border-t border-white/5 py-24 sm:py-32"
    >
      <motion.div
        variants={staggerContainer}
        {...revealOnce}
        className="container-px"
      >
        <motion.span variants={fadeUp} className="section-label">
          <span className="h-px w-6 bg-accent-cyan" /> Contact
        </motion.span>
        <motion.h2 variants={fadeUp} className="heading max-w-2xl">
          Let&apos;s build something.
        </motion.h2>
        <motion.p variants={fadeUp} className="mt-3 max-w-xl text-slate-400">
          Got a project, a role, or just want to talk data and AI? Drop me a
          line — I read everything.
        </motion.p>

        <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_1.1fr]">
          {/* Direct links */}
          <motion.div variants={fadeUp} className="space-y-3">
            {SOCIALS.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target={s.href.startsWith('http') ? '_blank' : undefined}
                rel={
                  s.href.startsWith('http') ? 'noreferrer noopener' : undefined
                }
                className="card group flex items-center justify-between px-5 py-4 hover:border-accent/30"
              >
                <div>
                  <p className="text-xs uppercase tracking-wider text-slate-500">
                    {s.label}
                  </p>
                  <p className="mt-0.5 text-sm font-medium text-white">
                    {s.value}
                  </p>
                </div>
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                  className="text-slate-500 transition-all group-hover:translate-x-0.5 group-hover:text-accent-cyan"
                >
                  <path d="M7 17 17 7M9 7h8v8" />
                </svg>
              </a>
            ))}
          </motion.div>

          {/* Form */}
          <motion.form
            variants={fadeUp}
            onSubmit={handleSubmit}
            className="card space-y-5 p-6 sm:p-8"
            noValidate
          >
            {/* Honeypot — visually hidden, ignored by humans. */}
            <div className="hidden" aria-hidden>
              <label htmlFor="company">Company</label>
              <input
                id="company"
                name="company"
                type="text"
                tabIndex={-1}
                autoComplete="off"
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Name" htmlFor="name">
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  autoComplete="name"
                  placeholder="Jane Doe"
                  className={inputClass}
                />
              </Field>
              <Field label="Email" htmlFor="email">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="jane@company.com"
                  className={inputClass}
                />
              </Field>
            </div>

            <Field label="Message" htmlFor="message">
              <textarea
                id="message"
                name="message"
                required
                rows={5}
                placeholder="What are you working on?"
                className={`${inputClass} resize-y`}
              />
            </Field>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="submit"
                disabled={status === 'sending'}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-accent px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
              >
                {status === 'sending' ? 'Sending…' : 'Send message'}
              </button>

              <p aria-live="polite" className="text-sm">
                {status === 'success' && (
                  <span className="text-accent-cyan">
                    Thanks — I&apos;ll be in touch soon.
                  </span>
                )}
                {status === 'error' && (
                  <span className="text-red-400">{error}</span>
                )}
              </p>
            </div>
          </motion.form>
        </div>
      </motion.div>
    </section>
  );
}

const inputClass =
  'w-full rounded-lg border border-white/10 bg-ink-950/60 px-4 py-2.5 text-sm text-white placeholder:text-slate-600 outline-none transition-colors focus:border-accent/50 focus:ring-2 focus:ring-accent/20';

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-slate-400"
      >
        {label}
      </label>
      {children}
    </div>
  );
}
