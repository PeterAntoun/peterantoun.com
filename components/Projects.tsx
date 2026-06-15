type Project = {
  title: string;
  category: string;
  year: string;
  description: string;
  tags: string[];
  href: string;
  image?: string;       // cover / logo image
  slides?: string[];    // study / case-study images shown below description
};

const PROJECTS: Project[] = [
  {
    title: 'AntounTwin',
    category: 'AI · Productivity',
    year: '2025',
    description:
      'A proactive AI agent that manages your entire GTD workflow — not a task manager, an always-on assistant. Captures anything via Telegram, runs the full GTD Clarify flowchart via Groq Llama 3, and proactively surfaces what to work on next using a Four-Criteria model.',
    tags: ['Next.js', 'Convex', 'Groq Llama 3', 'Telegram Bot', 'Google Calendar', 'Auth.js'],
    href: 'https://antoun-twin.vercel.app',
  },
  {
    title: 'M+ Renewal Calibration',
    category: 'Data · Retention',
    year: '2025',
    description:
      'Analysed the renewal behaviour of Monoprix M+ subscribers across a 2021–2026 cohort to answer one question: when should a discount voucher be sent to maximise renewals without cannibalising spontaneous ones? Built a cumulative renewal calendar and convergence model showing the natural renewal window closes at J+21 — the optimal send date.',
    tags: ['SQL', 'Snowflake', 'Cohort Analysis', 'Retention', 'Monoprix'],
    href: '#contact',
    image: '/projects/monoprix/logo.png',
    slides: [
      '/projects/monoprix/chart-convergence.png',
      '/projects/monoprix/chart-cumulative.png',
    ],
  },
  {
    title: 'Affiliate REM Uplift Analysis',
    category: 'Data · Performance Marketing',
    year: '2026',
    description:
      'PRE vs POST analysis of a Kwanko affiliate commission increase (29 Jan 2026). Despite a +39.7% budget increase, CAC remained nearly flat (+€6, +1.6%). New M+ subscribers grew +36.5% and the campaign generated a cross-sell effect — driving +37% more Express new clients in parallel. Co-authored with Joé Edjokola.',
    tags: ['SQL', 'Kwanko', 'Affiliate Marketing', 'CAC Analysis', 'Monoprix'],
    href: '#contact',
    image: '/projects/monoprix/logo.png',
  },
];

export default function Projects() {
  return (
    <section className="section" id="projects" style={{ paddingTop: 0 }}>
      <div className="wrap">
        <div className="sec-head" data-reveal>
          <h2>
            Selected
            <br />
            projects
          </h2>
          <span className="mono idx" data-scramble>(02 — built)</span>
        </div>

        <div className="proj-grid">
          {PROJECTS.map((p, i) => (
            <a
              key={p.title}
              href={p.href}
              target={p.href.startsWith('http') ? '_blank' : undefined}
              rel={p.href.startsWith('http') ? 'noreferrer noopener' : undefined}
              className="proj-card"
              data-reveal
              data-delay={String(i + 1)}
            >
              {/* cover image / placeholder */}
              <div className="proj-img">
                {p.image ? (
                  <img src={p.image} alt={p.title} />
                ) : (
                  <div className="proj-placeholder">
                    <span className="proj-placeholder-url mono">
                      {p.href.startsWith('http') ? p.href.replace('https://', '') : p.title}
                    </span>
                  </div>
                )}
                <span className="proj-visit">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M7 17L17 7M9 7h8v8"/></svg>
                </span>
              </div>

              {/* content */}
              <div className="proj-body">
                <div className="proj-meta">
                  <span className="mono proj-cat">{p.category}</span>
                  <span className="mono proj-year">{p.year}</span>
                </div>
                <h3 className="proj-title">{p.title}</h3>
                <p className="proj-desc">{p.description}</p>
                <ul className="p-tags proj-tags">
                  {p.tags.map((tag) => (
                    <li key={tag}>{tag}</li>
                  ))}
                </ul>

                {/* study slides */}
                {p.slides && p.slides.length > 0 && (
                  <div className="proj-slides">
                    {p.slides.map((src, si) => (
                      <img
                        key={si}
                        src={src}
                        alt={`${p.title} chart ${si + 1}`}
                        className="proj-slide-img"
                      />
                    ))}
                  </div>
                )}
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
