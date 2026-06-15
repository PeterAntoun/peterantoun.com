export default function ContactSection() {
  return (
    <section className="section" style={{ paddingBottom: 0 }}>
      <div className="wrap">
        <div className="contact" id="contact">
          <div className="wrap">
            <div className="ct-grid">
              <div data-reveal>
                <h2>
                  Let&apos;s build
                  <br />
                  something that <em>scales.</em>
                </h2>
                <p className="lead">
                  Currently exploring new roles where data, AI and marketing meet. If that
                  sounds like your team, I&apos;d love to talk.
                </p>
                <div className="ct-actions">
                  <a href="mailto:antounpeter@gmail.com" className="btn">
                    antounpeter@gmail.com <span className="arr"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M7 17L17 7M9 7h8v8"/></svg></span>
                  </a>
                </div>
              </div>

              <div className="ct-side" data-reveal data-delay="1">
                <div className="headshot-wrap">
                  <img src="/headshot.png" alt="Peter Antoun" className="headshot-circle" />
                </div>
                <div className="ct-links">
                  <a href="https://www.linkedin.com/in/peterantoun" target="_blank" rel="noreferrer noopener">
                    <span>LinkedIn</span><span className="ar"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M7 17L17 7M9 7h8v8"/></svg></span>
                  </a>
                  <a href="https://github.com/peterantoun" target="_blank" rel="noreferrer noopener">
                    <span>GitHub</span><span className="ar"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M7 17L17 7M9 7h8v8"/></svg></span>
                  </a>
                  <a href="#">
                    <span>Twitter / X</span><span className="ar"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M7 17L17 7M9 7h8v8"/></svg></span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
