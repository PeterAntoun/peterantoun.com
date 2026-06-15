type Project = {
  title: string;
  category: string;
  year: string;
  description: string;
  tags: string[];
  href: string;
  image?: string; // path to /public/... — leave undefined for placeholder
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
];

export default function Projects() {
  return (
    <section className="section" id="projects" style={{ paddingTop: 0 }}>
      <div className="wrap">
        <div className="sec-head" data-reveal>
          <h2>
            Built &amp;
            <br />
            shipped
          </h2>
          <span className="mono idx">(02 — projects)</span>
        </div>

        <div className="proj-grid">
          {PROJECTS.map((p, i) => (
            <a
              key={p.title}
              href={p.href}
              target="_blank"
              rel="noreferrer noopener"
              className="proj-card"
              data-reveal
              data-delay={String(i + 1)}
            >
              {/* image / placeholder */}
              <div className="proj-img">
                {p.image ? (
                  <img src={p.image} alt={p.title} />
                ) : (
                  <div className="proj-placeholder">
                    <span className="proj-placeholder-url mono">{p.href.replace('https://', '')}</span>
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
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
