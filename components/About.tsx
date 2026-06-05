'use client';

import { motion } from 'framer-motion';
import { staggerContainer, fadeUp, revealOnce } from '@/lib/motion';

const SKILLS = [
  'Data Analytics',
  'AI Agents',
  'Next.js',
  'Python',
  'SQL',
  'TypeScript',
  'n8n',
  'Snowflake',
];

const LANGUAGES = [
  { name: 'English', level: 'Fluent' },
  { name: 'French', level: 'Fluent' },
  { name: 'Arabic', level: 'Native' },
];

export default function About() {
  return (
    <section id="about" className="scroll-mt-20 py-24 sm:py-32">
      <motion.div
        variants={staggerContainer}
        {...revealOnce}
        className="container-px"
      >
        <motion.span variants={fadeUp} className="section-label">
          <span className="h-px w-6 bg-accent-cyan" /> About
        </motion.span>
        <motion.h2 variants={fadeUp} className="heading max-w-2xl">
          Data &amp; AI student, full-time builder.
        </motion.h2>

        <div className="mt-10 grid gap-12 lg:grid-cols-[1.2fr_1fr]">
          {/* Bio */}
          <motion.div variants={fadeUp} className="space-y-4 text-muted">
            <p>
              I&apos;m finishing a{' '}
              <span className="text-fg">Double Diplôme</span> — a BBA in
              Data, AI &amp; Management from{' '}
              <span className="text-fg">Audencia Business School</span>{' '}
              and <span className="text-fg">École Centrale de Nantes</span>
              , graduating September 2026.
            </p>
            <p>
              Right now I&apos;m at{' '}
              <span className="text-fg">Monoprix in Paris</span> on the
              Digital Marketing team, where I build analytics pipelines, campaign
              measurement tools, workflow automations, and{' '}
              <span className="text-fg">NL→SQL agents on Snowflake</span>.
            </p>
            <p>
              Outside of work I build AI agents, deploy bots on VPS, and run side
              projects across content creation, CRM tools, and blockchain. I like
              shipping things that are useful, fast, and a little bit clever.
            </p>

            {/* Languages */}
            <div className="!mt-8">
              <h3 className="mb-3 text-sm font-medium text-muted">
                Languages
              </h3>
              <div className="flex flex-wrap gap-3">
                {LANGUAGES.map((lang) => (
                  <div
                    key={lang.name}
                    className="flex items-baseline gap-2 rounded-lg border border-line/10 bg-surface/70 px-4 py-2"
                  >
                    <span className="text-sm font-medium text-fg">
                      {lang.name}
                    </span>
                    <span className="text-xs text-accent-cyan">
                      {lang.level}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Skills grid */}
          <motion.div variants={fadeUp}>
            <h3 className="mb-4 text-sm font-medium text-muted">
              What I work with
            </h3>
            <motion.ul
              variants={staggerContainer}
              {...revealOnce}
              className="grid grid-cols-2 gap-3"
            >
              {SKILLS.map((skill) => (
                <motion.li
                  key={skill}
                  variants={fadeUp}
                  className="card group flex items-center gap-3 px-4 py-3 hover:border-accent/30"
                >
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent transition-transform group-hover:scale-150" />
                  <span className="text-sm text-fg">{skill}</span>
                </motion.li>
              ))}
            </motion.ul>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
