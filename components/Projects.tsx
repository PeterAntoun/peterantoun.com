'use client';

import { motion } from 'framer-motion';
import { staggerContainer, fadeUp, revealOnce } from '@/lib/motion';

type Project = {
  title: string;
  description: string;
  tags: string[];
  href: string;
  linkLabel: string;
  featured?: boolean;
};

const PROJECTS: Project[] = [
  {
    title: 'Monoprix Analytics Platform',
    description:
      'An internal analytics platform that lets marketers query data in plain language. A natural-language→SQL agent runs on Snowflake, with campaign measurement pulled from Piano Analytics and Eulerian.',
    tags: ['Streamlit', 'Snowflake', 'NL→SQL', 'Piano Analytics', 'Eulerian'],
    href: '#contact',
    linkLabel: 'Ask me about it',
    featured: true,
  },
  {
    title: 'AI Agent Infrastructure',
    description:
      'A self-hosted agent stack: Hermes Agent deployed on a VPS, wired up with OpenClaw, MiniMax-M2, and Brave Search for autonomous research and task execution.',
    tags: ['Hermes Agent', 'VPS', 'OpenClaw', 'MiniMax-M2', 'Brave Search'],
    href: '#contact',
    linkLabel: 'Ask me about it',
    featured: true,
  },
  {
    title: 'Lebanon CRM Platform',
    description:
      'A CRM and outbound platform targeting dentists and physios across the GCC, with Apollo.io lead generation feeding qualified prospects into automated sequences.',
    tags: ['CRM', 'Apollo.io', 'Lead Gen', 'Automation'],
    href: '#contact',
    linkLabel: 'Ask me about it',
  },
  {
    title: 'Interactive Financial Simulator',
    description:
      'A React app that models Paris real-estate investment scenarios — cash flow, leverage, and returns — with live, interactive inputs.',
    tags: ['React', 'Finance', 'Modeling', 'Data Viz'],
    href: '#contact',
    linkLabel: 'Ask me about it',
  },
  {
    title: 'This Portfolio',
    description:
      "The site you’re on. Built from scratch with Next.js 14, Tailwind, and Framer Motion. Dark, fast, and fully responsive.",
    tags: ['Next.js', 'Tailwind', 'Framer Motion', 'TypeScript'],
    href: 'https://github.com/peterantoun/peterantoun.com',
    linkLabel: 'View source',
  },
];

export default function Projects() {
  return (
    <section
      id="projects"
      className="scroll-mt-20 border-t border-line/10 py-24 sm:py-32"
    >
      <motion.div
        variants={staggerContainer}
        {...revealOnce}
        className="container-px"
      >
        <motion.span variants={fadeUp} className="section-label">
          <span className="h-px w-6 bg-accent-cyan" /> Projects
        </motion.span>
        <motion.h2 variants={fadeUp} className="heading max-w-2xl">
          Things I&apos;ve built.
        </motion.h2>
        <motion.p
          variants={fadeUp}
          className="mt-3 max-w-xl text-muted"
        >
          A mix of work, side projects, and experiments. From production
          analytics to autonomous agents.
        </motion.p>

        <motion.div
          variants={staggerContainer}
          {...revealOnce}
          className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
        >
          {PROJECTS.map((project) => (
            <ProjectCard key={project.title} project={project} />
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}

function ProjectCard({ project }: { project: Project }) {
  const isExternal = project.href.startsWith('http');

  return (
    <motion.a
      variants={fadeUp}
      href={project.href}
      target={isExternal ? '_blank' : undefined}
      rel={isExternal ? 'noreferrer noopener' : undefined}
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
      className={`card group relative flex flex-col p-6 hover:border-accent/30 hover:glow-ring ${
        project.featured ? 'sm:col-span-2 lg:col-span-1' : ''
      }`}
    >
      {project.featured && (
        <span className="absolute right-5 top-5 rounded-full border border-accent/30 bg-accent/10 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-accent">
          Featured
        </span>
      )}

      <h3 className="pr-16 text-lg font-semibold text-fg">
        {project.title}
      </h3>
      <p className="mt-3 flex-1 text-sm leading-relaxed text-muted">
        {project.description}
      </p>

      <div className="mt-5 flex flex-wrap gap-2">
        {project.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-md border border-line/10 bg-fg/[0.03] px-2.5 py-1 text-xs text-muted"
          >
            {tag}
          </span>
        ))}
      </div>

      <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-accent-cyan">
        {project.linkLabel}
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
          className="transition-transform group-hover:translate-x-0.5"
        >
          <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
      </span>
    </motion.a>
  );
}
