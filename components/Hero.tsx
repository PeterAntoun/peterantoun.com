export default function Hero() {
  return (
    <section className="hero">
      <div className="wrap">
        <div className="eyebrow mono" data-reveal>
          <span className="ln" />
          <span data-scramble>Data · AI · Marketing</span>
        </div>

        <h1 className="bigname" aria-label="Peter Antoun">
          <span className="row"><span className="word">Peter</span></span>
          <span className="row"><span className="word">Antoun</span></span>
        </h1>

        <div className="hero-foot">
          <p className="tagline" data-reveal data-delay="1">
            I help scale brands with <em>data-driven</em> strategies.
          </p>
          <div className="hero-meta" data-reveal data-delay="2">
            <div className="hero-cta">
              <a href="#contact" className="btn">
                Hire me <span className="arr"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M7 17L17 7M9 7h8v8"/></svg></span>
              </a>
              <a href="#work" className="btn ghost">
                See the work
              </a>
            </div>
            <span className="availability">
              <span className="pulse" />
              Open to new roles · 2026
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
