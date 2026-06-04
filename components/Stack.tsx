'use client';

import { motion } from 'framer-motion';
import { staggerContainer, fadeUp, revealOnce } from '@/lib/motion';

type Tool = {
  name: string;
  category: string;
  // Two-letter monogram used as a lightweight icon.
  mark: string;
};

const TOOLS: Tool[] = [
  { name: 'Next.js', category: 'Framework', mark: 'Nx' },
  { name: 'Python', category: 'Language', mark: 'Py' },
  { name: 'SQL', category: 'Data', mark: 'SQL' },
  { name: 'TypeScript', category: 'Language', mark: 'TS' },
  { name: 'n8n', category: 'Automation', mark: 'n8' },
  { name: 'Snowflake', category: 'Warehouse', mark: 'Sf' },
  { name: 'Piano Analytics', category: 'Analytics', mark: 'Pa' },
  { name: 'Claude AI', category: 'AI', mark: 'AI' },
  { name: 'Vercel', category: 'Hosting', mark: 'Vc' },
  { name: 'GitHub', category: 'Version Control', mark: 'Gh' },
];

export default function Stack() {
  return (
    <section
      id="stack"
      className="scroll-mt-20 border-t border-white/5 py-24 sm:py-32"
    >
      <motion.div
        variants={staggerContainer}
        {...revealOnce}
        className="container-px"
      >
        <motion.span variants={fadeUp} className="section-label">
          <span className="h-px w-6 bg-accent-cyan" /> Stack &amp; Uses
        </motion.span>
        <motion.h2 variants={fadeUp} className="heading max-w-2xl">
          Tools I reach for daily.
        </motion.h2>
        <motion.p variants={fadeUp} className="mt-3 max-w-xl text-slate-400">
          The kit behind the pipelines, agents, and apps.
        </motion.p>

        <motion.div
          variants={staggerContainer}
          {...revealOnce}
          className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5"
        >
          {TOOLS.map((tool) => (
            <motion.div
              key={tool.name}
              variants={fadeUp}
              whileHover={{ y: -4 }}
              transition={{ type: 'spring', stiffness: 300, damping: 22 }}
              className="card group flex flex-col items-center gap-3 px-4 py-6 text-center hover:border-accent/30"
            >
              <span className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-accent/20 to-accent-cyan/10 text-sm font-semibold text-accent ring-1 ring-white/5 transition-transform group-hover:scale-110">
                {tool.mark}
              </span>
              <div>
                <p className="text-sm font-medium text-white">{tool.name}</p>
                <p className="text-xs text-slate-500">{tool.category}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}
