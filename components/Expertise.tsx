const PILLARS = [
  {
    num: '01',
    title: 'Data',
    desc: 'Building the measurement foundation — attribution, experimentation and dashboards that make the next decision obvious.',
    tags: ['Attribution', 'SQL · dbt', 'A/B Testing', 'BI'],
  },
  {
    num: '02',
    title: 'AI',
    desc: 'Putting models to work — from predictive LTV and churn to LLM-powered content and automation that scale a small team.',
    tags: ['LLMs', 'Forecasting', 'Automation', 'Python'],
  },
  {
    num: '03',
    title: 'Marketing',
    desc: 'Translating insight into growth — performance channels, lifecycle and positioning that compound month over month.',
    tags: ['Growth', 'Lifecycle', 'Paid · SEO', 'Brand'],
  },
];

export default function Expertise() {
  return (
    <section className="section" id="expertise">
      <div className="wrap">
        <div className="sec-head" data-reveal>
          <h2>
            How I create
            <br />
            impact
          </h2>
          <span className="mono idx" data-scramble>
            (01 — 03)
          </span>
        </div>

        <div className="pillars">
          {PILLARS.map((p, i) => (
            <a
              key={p.num}
              className="pillar"
              href="#work"
              data-reveal
              data-delay={String(i + 1)}
            >
              <div className="p-top">
                <span className="p-num">{p.num}</span>
                <span className="p-arrow">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M7 17L17 7M9 7h8v8"/></svg>
                </span>
              </div>
              <h3 className="p-title">{p.title}</h3>
              <p className="p-desc">{p.desc}</p>
              <ul className="p-tags">
                {p.tags.map((tag) => (
                  <li key={tag}>{tag}</li>
                ))}
              </ul>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
